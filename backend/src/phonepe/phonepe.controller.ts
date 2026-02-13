
import { Controller, Post, Body, Res, Param, Get, Query, Logger } from '@nestjs/common';
import { PhonePeService } from './phonepe.service';
import { OrdersService } from '../orders/orders.service';
import { Response } from 'express';

@Controller('phonepe')
export class PhonePeController {
    private readonly logger = new Logger(PhonePeController.name);

    constructor(
        private phonepeService: PhonePeService,
        private ordersService: OrdersService
    ) { }

    @Post('initiate')
    async initiatePayment(@Body() body: { orderId: string, amount: number, mobile: string, userId?: string }) {
        return await this.phonepeService.initiatePayment(body.orderId, body.amount, body.mobile, body.userId);
    }

    @Post('callback')
    async handleCallback(@Body() body: any, @Res() res: Response) {
        // PhonePe server sends base64 encoded JSON body
        try {
            if (body.response) {
                const decoded = Buffer.from(body.response, 'base64').toString('utf-8');
                const data = JSON.parse(decoded);
                this.logger.log(`PhonePe Callback: ${JSON.stringify(data)}`);

                if (data.code === 'PAYMENT_SUCCESS') {
                    // Extract Order ID from MerchantTransactionID (MT_TIMESTAMP_ORDERID)
                    // Assuming format MT{timestamp}_{orderIdSuffix} or just finding by merchantTransactionId

                    // Since we can't easily parse OrderID if we hashed/sliced it, 
                    // we should ideally store merchantTransactionId in DB during initiate.
                    // BUT: In our initiatePayment service, we didn't save it to DB yet.
                    // Let's rely on the metadata or the fact that we can store it in createOrder.

                    /* 
                       Better approach: 
                       In initiatePayment, we passed `merchantTransactionId`. 
                       We should try to find the order by `phonepeMerchantTransactionId` if we saved it.
                       However, we haven't saved it in createOrder yet.
                       
                       Let's extract orderId from the `merchantTransactionId` if we structured it predictably.
                       Our service uses: `MT${Date.now()}_${orderId.slice(-6)}`.
                       This is lossy (only last 6 chars). 
                       
                       CRITICAL FIX: 
                       We need to pass the full Order ID in the merchantTransactionId OR 
                       update the Order with the merchantTransactionId at the time of initiation.
                    */

                    const merchantTransactionId = data.data.merchantTransactionId;
                    const phonepeTransactionId = data.data.transactionId;

                    // We need to find the order. 
                    // OPTION: We search for the order where phonepeMerchantTransactionId matches.
                    const order = await this.ordersService.findByPhonePeTransactionId(merchantTransactionId);

                    if (order) {
                        await this.ordersService.confirmPhonePePayment(order.id, merchantTransactionId, phonepeTransactionId);
                    }
                }
            }
        } catch (e) {
            this.logger.error('Callback parsing error', e);
        }

        // Always respond success to PhonePe to stop retries
        return res.status(200).json({ success: true });
    }

    // Handles the redirect from PhonePe (POST or GET depending on mode)
    // If RedirectMode is POST, this receives form data. If GET, we just check status.
    // Simplifying to a status check endpoint for the frontend to poll or final redirect 

    @Get('check-status/:txnId')
    async checkStatus(@Param('txnId') txnId: string) {
        return await this.phonepeService.verifyPayment(txnId);
    }

    @Post('redirect')
    async handleRedirect(@Query('orderId') orderId: string, @Res() res: Response) {
        // This endpoint handles the POST redirect from PhonePe after payment
        // We simply redirect the user to the frontend success page
        const frontendUrl = process.env.FRONTEND_URL || 'https://www.sparkbluediamond.com';
        return res.redirect(`${frontendUrl}/orders/success?id=${orderId}`);
    }
}
