import { Module, forwardRef } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';
import { RazorpayController } from './razorpay.controller';
import { OrdersModule } from '../orders/orders.module'; // Import OrdersModule to use OrdersService

@Module({
    imports: [forwardRef(() => OrdersModule)],
    controllers: [RazorpayController],
    providers: [RazorpayService],
    exports: [RazorpayService],
})
export class RazorpayModule { }
