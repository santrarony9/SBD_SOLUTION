import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendPasswordResetEmail(to: string, token: string) {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

        const mailOptions = {
            from: `"Spark Blue Diamond" <${process.env.SMTP_USER}>`,
            to,
            subject: 'Password Reset Request - Spark Blue Diamond',
            html: `
                <div style="font-family: 'serif'; color: #001f3f; padding: 40px; border: 1px solid #D4AF37;">
                    <h1 style="color: #001f3f; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">Spark Blue Diamond</h1>
                    <p>Hello,</p>
                    <p>You requested a password reset for your Spark Blue account.</p>
                    <p>Please click the link below to reset your password. This link will expire in 1 hour.</p>
                    <a href="${resetUrl}" style="background: #001f3f; color: #D4AF37; padding: 12px 24px; text-decoration: none; display: inline-block; font-weight: bold; margin-top: 20px;">RESET PASSWORD</a>
                    <p style="margin-top: 30px; font-size: 12px; color: #666;">If you did not request this, please ignore this email.</p>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);

        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send reset email');
        }
    }

    async sendAbandonedCartEmail(to: string, userName: string, productName: string, productLink: string) {
        const mailOptions = {
            from: `"Spark Blue Diamond" <${process.env.SMTP_USER}>`,
            to,
            subject: 'You left something sparkling behind... ✨',
            html: `
                <div style="font-family: 'serif'; color: #001f3f; padding: 40px; border: 1px solid #D4AF37; max-width: 600px; margin: 0 auto; background-color: #f9f9f9;">
                    <h1 style="color: #001f3f; text-align: center; border-bottom: 2px solid #D4AF37; padding-bottom: 20px;">Spark Blue Diamond</h1>
                    
                    <p style="font-size: 16px;">Dear ${userName},</p>
                    
                    <p style="font-size: 16px;">We noticed you left <strong>${productName}</strong> in your cart. It's a truly exquisite piece that deserves to be worn.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${productLink}" style="background: #001f3f; color: #D4AF37; padding: 15px 30px; text-decoration: none; display: inline-block; font-weight: bold; border: 1px solid #D4AF37;">COMPLETE YOUR ORDER</a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666; text-align: center;">Need help? Reply to this email or contact our concierge.</p>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);

        } catch (error) {
            console.error('Error sending abandoned cart email:', error);
            // Don't throw, just log so cleanup service continues
        }
    }
}
