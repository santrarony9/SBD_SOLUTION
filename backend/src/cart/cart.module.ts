import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { PricingModule } from '../pricing/pricing.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module'; // To check product validity if needed

import { PromosModule } from '../promos/promos.module';

@Module({
    imports: [PrismaModule, ProductsModule, PricingModule, PromosModule],
    controllers: [CartController],
    providers: [CartService],
    exports: [CartService],
})
export class CartModule { }
