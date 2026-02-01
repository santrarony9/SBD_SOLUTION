import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    SmsModule,
    JwtModule.register({
      secret: 'SECRET_KEY_Should_Be_Env_Var', // In prod use env
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule { }
