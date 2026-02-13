import { Module } from '@nestjs/common';
import { CcavenueController } from './ccavenue.controller';
import { CcavenueService } from './ccavenue.service';
import { OrdersModule } from '../orders/orders.module';

@Module({
    imports: [OrdersModule],
    controllers: [CcavenueController],
    providers: [CcavenueService],
    exports: [CcavenueService]
})
export class CcavenueModule { }
