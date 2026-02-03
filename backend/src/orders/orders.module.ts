import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CartModule } from '../cart/cart.module';
import { CrmModule } from '../crm/crm.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
    imports: [PrismaModule, CartModule, CrmModule, InventoryModule],
    controllers: [OrdersController],
    providers: [OrdersService],
})
export class OrdersModule { }
