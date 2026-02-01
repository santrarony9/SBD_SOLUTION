import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SmsService } from '../sms/sms.service';
import { MailService } from '../mail/mail.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private smsService: SmsService,
        private mailService: MailService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        };
    }

    async register(data: any) {
        // ... existing register logic ...
        // Check if user exists
        const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            throw new UnauthorizedException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
        });

        const { password, ...result } = user;
        return result;
    }

    // OTP LOGIC
    async sendOtp(mobile: string) {
        // Simple 6 digit random number
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // Upsert user (create placeholder if not exists)
        // Check if mobile exists first to decide create or update
        // Prisma upsert needs unique where, mobile is unique now.

        let user = await this.prisma.user.findUnique({ where: { mobile } });

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    mobile,
                    otp,
                    otpExpiry,
                    name: 'Guest User', // Placeholder
                    role: 'USER',
                    email: undefined // Allow null
                }
            });
        } else {
            await this.prisma.user.update({
                where: { mobile },
                data: { otp, otpExpiry }
            });
        }

        // Send SMS
        await this.smsService.sendOtp(mobile, otp);
        return { message: 'OTP Sent successfully' };
    }

    async loginWithOtp(mobile: string, otp: string) {
        const user = await this.prisma.user.findUnique({ where: { mobile } });

        if (!user || user.otp !== otp || new Date() > user.otpExpiry) {
            throw new UnauthorizedException('Invalid or Expired OTP');
        }

        // Clear OTP
        await this.prisma.user.update({
            where: { id: user.id },
            data: { otp: null, otpExpiry: null }
        });

        // Generate Token
        return this.login(user);
    }

    async forgotPassword(email: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Don't reveal if user exists or not for security
            return { message: 'If an account exists with this email, a reset link has been sent.' };
        }

        const resetToken = uuidv4();
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        await this.prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpiry },
        });

        await this.mailService.sendPasswordResetEmail(email, resetToken);

        return { message: 'If an account exists with this email, a reset link has been sent.' };
    }

    async resetPassword(token: string, newPass: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() },
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid or expired reset token');
        }

        const hashedPassword = await bcrypt.hash(newPass, 10);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        return { message: 'Password reset successfully' };
    }
}
