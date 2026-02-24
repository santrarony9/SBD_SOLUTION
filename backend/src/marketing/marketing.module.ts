import { Module } from '@nestjs/common';
import { MarketingController } from './marketing.controller';
import { MarketingService } from './marketing.service';
import { PrismaModule } from '../prisma/prisma.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { ProductsModule } from '../products/products.module';

@Module({
    imports: [PrismaModule, WhatsappModule, ProductsModule],
    controllers: [MarketingController],
    providers: [MarketingService],
})
export class MarketingModule { }
