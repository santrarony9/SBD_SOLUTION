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

@Module({
  imports: [
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
    ReviewsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
