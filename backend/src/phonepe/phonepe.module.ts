
import { Module } from '@nestjs/common';
import { PhonePeService } from './phonepe.service';
import { PhonePeController } from './phonepe.controller';
import { OrdersModule } from '../orders/orders.module';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [OrdersModule, PrismaModule, HttpModule],
    controllers: [PhonePeController],
    providers: [PhonePeService],
    exports: [PhonePeService],
})
export class PhonePeModule { }
