import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { MastersModule } from './masters/masters.module';
import { PrismaModule } from './prisma/prisma.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { ReviewsModule } from './reviews/reviews.module';

import { SmsModule } from './sms/sms.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ProfileModule } from './profile/profile.module';
import { MailModule } from './mail/mail.module';
import { DiagnosticsModule } from './diagnostics/diagnostics.module';
import { OffersModule } from './offers/offers.module';
import { ScheduleModule } from '@nestjs/schedule';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { CartCleanupService } from './scheduler/cart-cleanup.service';
import { PromosModule } from './promos/promos.module';
import { StoreModule } from './store/store.module';
import { BannerModule } from './banner/banner.module';
import { MarketingModule } from './marketing/marketing.module';
import { InventoryModule } from './inventory/inventory.module';
import { CrmModule } from './crm/crm.module';
import { InvoiceModule } from './invoice/invoice.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    WhatsappModule,
    StoreModule,
    BannerModule,
    MarketingModule,
    MailModule,
    ProfileModule,
    DashboardModule,
    SmsModule,
    AuthModule,
    ProductsModule,
    MastersModule,
    PrismaModule,
    CartModule,
    OrdersModule,
    WishlistModule,
    ReviewsModule,
    DiagnosticsModule,
    OffersModule,
    PromosModule,
    InventoryModule,
    CrmModule,
    InvoiceModule,
    MediaModule
  ],
  controllers: [AppController],
  providers: [AppService, CartCleanupService],
})
export class AppModule { }
