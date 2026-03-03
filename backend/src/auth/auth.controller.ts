import { Controller, Post, Get, Body, UnauthorizedException, UseGuards, Request, Delete, Param, Logger, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleAuthGuard } from './google-auth.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() req: { email: string; password: string }) {
        const user = await this.authService.validateUser(req.email, req.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user); // Returns token + user info
    }

    @Post('register')
    async register(@Body() body: any) {
        return this.authService.register(body);
    }

    @Post('send-otp')
    async sendOtp(@Body() body: { mobile: string }) {
        return this.authService.sendOtp(body.mobile);
    }

    @Post('login-otp')
    async loginOtp(@Body() body: { mobile: string; otp: string }) {
        return this.authService.loginWithOtp(body.mobile, body.otp);
    }

    @Post('forgot-password')
    async forgotPassword(@Body() body: { email: string }) {
        return this.authService.forgotPassword(body.email);
    }

    @Post('reset-password')
    async resetPassword(@Body() body: { token: string; newPass: string }) {
        return this.authService.resetPassword(body.token, body.newPass);
    }

    @Get('ping')
    async ping() {
        return { message: 'pong', version: '2.1' };
    }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth(@Request() req) {
        // Guard initiates auth
    }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleAuthRedirect(@Request() req, @Res() res: Response) {
        const user = await this.authService.findOrCreateFromGoogle(req.user);
        const { access_token } = await this.authService.login(user);

        // Redirect to frontend with token and user data
        const frontendUrl = process.env.FRONTEND_URL || 'https://sparkbluediamond.com';
        const userData = encodeURIComponent(JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: (user as any).avatar
        }));

        return res.redirect(`${frontendUrl}/auth/callback?token=${access_token}&user=${userData}`);
    }
}
