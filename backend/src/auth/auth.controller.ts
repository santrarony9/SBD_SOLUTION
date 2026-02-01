import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

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
}
