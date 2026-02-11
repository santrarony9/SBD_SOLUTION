import { Controller, Post, Body, BadRequestException, UseGuards } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';
import { OrdersService } from '../orders/orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('razorpay')
export class RazorpayController {
    constructor(
        private razorpayService: RazorpayService,
        private ordersService: OrdersService
    ) { }

    @Post('verify')
    @UseGuards(JwtAuthGuard) // Ensure user is logged in
    async verifyPayment(@Body() body: { razorpayOrderId: string; razorpayPaymentId: string; signature: string; orderId: string }) {
        const isValid = this.razorpayService.verifyPayment(
            body.razorpayOrderId,
            body.razorpayPaymentId,
            body.signature
        );

        if (isValid) {
            // Update local order status
            await this.ordersService.updateOrderStatus(body.orderId, 'CONFIRMED'); // Or PAID
            // You might want a specific method verifyAndConfirmOrder in OrdersService to handle this cleaner
            // For now, reuse updateOrderStatus or add logic there.

            // Specifically verify payment status
            await (this.ordersService as any).markAsPaid(body.orderId, body.razorpayPaymentId);

            return { success: true, message: 'Payment Verified' };
        } else {
            await this.ordersService.updateOrderStatus(body.orderId, 'PAYMENT_FAILED');
            throw new BadRequestException('Invalid Payment Signature');
        }
    }
}
