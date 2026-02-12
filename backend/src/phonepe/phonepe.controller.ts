
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
                    // Extract Order ID or use MerchantTransactionID to find order
                    // Since we encoded orderId in merchantTransactionId (MT_TIMESTAMP_ORDERID), we can extract it or link it
                    // For simplicity, let's assume we can confirm via transaction ID logic

                    // TODO: Update Order Status
                    // await this.ordersService.confirmPayment(...)
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
}
