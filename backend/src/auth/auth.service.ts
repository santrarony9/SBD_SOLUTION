import { Injectable, UnauthorizedException, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// import { Role } from '@prisma/client';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SmsService } from '../sms/sms.service';
import { MailService } from '../mail/mail.service';
import { v4 as uuidv4 } from 'uuid';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private smsService: SmsService,
        private mailService: MailService,
        private whatsappService: WhatsappService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const normalizedEmail = email.toLowerCase();


        const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });

        if (!user) {

            return null;
        }



        const isMatch = await bcrypt.compare(pass, user.password || '');


        if (user && isMatch) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        // Ensure the payload strictly captures the role for frontend routing
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

        // OTP Requirement REMOVED for now as per user request
        /*
        if (!mobile || !otp) {
            throw new UnauthorizedException('Mobile and OTP are required');
        }
        */

        const normalizedEmail = email.toLowerCase();

        // 1. Check for existing user by email FIRST for smoother UX
        const existingEmail = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });

        if (existingEmail) {
            // If it's a "STAFF" or "ADMIN" and doesn't have a mobile yet, or just existing
            throw new UnauthorizedException('Email already in use. Please login or use a different email.');
        }

        // 2. Check if mobile is used by ANOTHER user
        if (mobile) {
            const existingMobile = await this.prisma.user.findFirst({ where: { mobile } });
            if (existingMobile) {
                throw new UnauthorizedException('Mobile number already registered. Please login.');
            }
        }

        // 3. Create Full User
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await this.prisma.user.create({
            data: {
                name,
                email: normalizedEmail,
                password: hashedPassword,
                mobile: mobile || null,
                role: 'USER'
            },
        });

        const { password: _, ...result } = newUser;

        // Send Welcome Message (Handled with Fallback)
        if (newUser.mobile) {
            this.whatsappService.sendWelcomeMessage(newUser.mobile, newUser.name)
                .catch(e => this.logger.warn("Welcome Msg Simulation/Failed", e.message));
        }

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
        // Send SMS
        await this.smsService.sendOtp(mobile, otp);

        // Send WhatsApp OTP
        this.whatsappService.sendOtp(mobile, otp).catch(e => console.error("WhatsApp OTP Failed", e));

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
