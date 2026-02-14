import { Module, forwardRef } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CartModule } from '../cart/cart.module';
import { CrmModule } from '../crm/crm.module';
import { InventoryModule } from '../inventory/inventory.module';

import { ShiprocketModule } from '../shiprocket/shiprocket.module';
import { RazorpayModule } from '../razorpay/razorpay.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
    imports: [
        PrismaModule,
        CartModule,
        CrmModule,
        InventoryModule,
        ShiprocketModule,
        forwardRef(() => RazorpayModule),
        WhatsappModule
    ],
    providers: [OrdersService],
    controllers: [OrdersController],
    exports: [OrdersService]
})
export class OrdersModule { }
