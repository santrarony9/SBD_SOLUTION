import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { CcavenueService } from './ccavenue.service';
import { OrdersService } from '../orders/orders.service';
import { Response } from 'express';

@Controller('ccavenue')
export class CcavenueController {
    constructor(
        private ccavenueService: CcavenueService,
        private ordersService: OrdersService
    ) { }

    @Post('initiate')
    async initiate(@Body() body: { orderId: string; amount: number; user: any }) {
        const { encRequest, access_code } = this.ccavenueService.getInitiateParams(
            body.orderId,
            body.amount,
            body.user
        );

        return {
            encRequest,
            access_code,
            url: 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction'
        };
    }

    @Post('callback')
    async callback(@Body() body: any, @Res() res: Response) {
        const { encResp } = body;
        const decryptedResponse = this.ccavenueService.decrypt(encResp); // Implement decrypt in service

        // Parse the decrypted string (key=value&key=value)
        const params = new URLSearchParams(decryptedResponse);
        const orderStatus = params.get('order_status');
        const orderId = params.get('order_id');
        const trackingId = params.get('tracking_id');
        const failureMessage = params.get('failure_message');

        const frontendUrl = process.env.FRONTEND_URL || 'https://sparkbluediamond.com';

        if (orderStatus === 'Success') {
            const bankRefNo = params.get('bank_ref_no');
            await (this.ordersService as any).confirmCcavenuePayment(orderId, trackingId, bankRefNo);
            return res.redirect(`${frontendUrl}/payment/success?orderId=${orderId}`);
        } else {
            // Update order status to FAILED
            await this.ordersService.updateOrderStatus(orderId, 'PAYMENT_FAILED');
            return res.redirect(`${frontendUrl}/payment/failure?orderId=${orderId}&message=${failureMessage}`);
        }
    }
}
