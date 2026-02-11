import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class RazorpayService {
    private readonly logger = new Logger(RazorpayService.name);
    private instance: any;

    constructor() {
        this.instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourKeyHere',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourSecretHere',
        });
    }

    async createOrder(amount: number, currency: string = 'INR', receipt: string) {
        try {
            const options = {
                amount: Math.round(amount * 100), // Amount in smallest currency unit (paise)
                currency,
                receipt,
            };
            const order = await this.instance.orders.create(options);
            this.logger.log(`Razorpay Order Created: ${order.id} for amount: ${amount}`);
            return order;
        } catch (error) {
            console.error('Razorpay Create Order Error:', error);
            throw new BadRequestException('Failed to create Razorpay order');
        }
    }

    verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, signature: string): boolean {
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YourSecretHere')
            .update(razorpayOrderId + '|' + razorpayPaymentId)
            .digest('hex');

        return generatedSignature === signature;
    }
}
