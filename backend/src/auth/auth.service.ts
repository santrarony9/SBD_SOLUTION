import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// import { Role } from '@prisma/client';

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
        const normalizedEmail = email.toLowerCase();
        console.log(`[AUTH DEBUG] Attempting login for: ${email} -> ${normalizedEmail}`);

        const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });

        if (!user) {
            console.log(`[AUTH DEBUG] User NOT FOUND: ${normalizedEmail}`);
            return null;
        }

        console.log(`[AUTH DEBUG] User FOUND: ${user.email}, Role: ${user.role}, Hash: ${user.password?.substring(0, 10)}...`);

        const isMatch = await bcrypt.compare(pass, user.password || '');
        console.log(`[AUTH DEBUG] Password validation result: ${isMatch}`);

        if (user && isMatch) {
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
        const { mobile, otp, name, password, email } = data;

        if (!mobile || !otp) {
            throw new UnauthorizedException('Mobile and OTP are required');
        }

        const normalizedEmail = email.toLowerCase();

        // 1. Check for valid OTP on the mobile record
        const userByMobile = await this.prisma.user.findFirst({ where: { mobile } });
        if (!userByMobile) {
            throw new UnauthorizedException('Please request OTP first');
        }

        if (userByMobile.otp !== otp || !userByMobile.otpExpiry || new Date() > userByMobile.otpExpiry) {
            throw new UnauthorizedException('Invalid or Expired OTP');
        }

        // 2. Prevent overwriting existing full accounts
        if (userByMobile.email && userByMobile.password) {
            throw new UnauthorizedException('User already registered. Please login.');
        }

        // 3. Check if email is taken by ANOTHER user (should theoretically not happen if mobile is key, but safety first)
        const existingEmail = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existingEmail && existingEmail.id !== userByMobile.id) {
            throw new UnauthorizedException('Email already in use');
        }

        // 4. Update the placeholder user to Full User
        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedUser = await this.prisma.user.update({
            where: { id: userByMobile.id },
            data: {
                name,
                email: normalizedEmail,
                password: hashedPassword,
                otp: null, // Clear OTP after usage
                otpExpiry: null,
                role: 'USER' // Ensure role is set
            },
        });

        const { password: _, ...result } = updatedUser;
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

        let user = await this.prisma.user.findFirst({ where: { mobile } });

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
                where: { id: user.id },
                data: { otp, otpExpiry }
            });
        }

        // Send SMS
        await this.smsService.sendOtp(mobile, otp);
        return { message: 'OTP Sent successfully' };
    }

    async loginWithOtp(mobile: string, otp: string) {
        const user = await this.prisma.user.findFirst({ where: { mobile } });

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
        const normalizedEmail = email.toLowerCase();
        const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
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
