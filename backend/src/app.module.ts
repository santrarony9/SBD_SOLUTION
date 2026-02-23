import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { TrafficMiddleware } from './common/middleware/traffic.middleware';
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
import { CartRecoveryService } from './scheduler/cart-recovery.service';
import { PromosModule } from './promos/promos.module';
import { StoreModule } from './store/store.module';
import { BannerModule } from './banner/banner.module';
import { MarketingModule } from './marketing/marketing.module';
import { InventoryModule } from './inventory/inventory.module';
import { CrmModule } from './crm/crm.module';
import { InvoiceModule } from './invoice/invoice.module';
import { MediaModule } from './media/media.module';
import { ShiprocketModule } from './shiprocket/shiprocket.module';
import { ChatModule } from './chat/chat.module';
import { RazorpayModule } from './razorpay/razorpay.module';
import { CategoriesModule } from './categories/categories.module';
import { UsersModule } from './users/users.module';
import { PhonePeModule } from './phonepe/phonepe.module';
import { GalleryModule } from './gallery/gallery.module';
import { CcavenueModule } from './ccavenue/ccavenue.module';
import { ConfigModule } from '@nestjs/config'; // Added ConfigModule import

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Added ConfigModule
    ScheduleModule.forRoot(),
    GalleryModule,
    ChatModule,
    WhatsappModule,
    StoreModule,
    BannerModule,
    MarketingModule,
    CategoriesModule,
    MailModule,
    ProfileModule,
    DashboardModule,
    SmsModule,
    AuthModule,
    PhonePeModule,
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
    UsersModule,
    InventoryModule,
    CrmModule,
    InvoiceModule,
    MediaModule,
    ShiprocketModule,
    RazorpayModule,
    CcavenueModule
  ],
  controllers: [AppController],
  providers: [AppService, CartCleanupService, CartRecoveryService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes('*');
  }
}
