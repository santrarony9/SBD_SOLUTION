import { Controller, Post, Get, Body, UnauthorizedException, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

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

    @UseGuards(JwtAuthGuard)
    @Post('admin/create')
    async createAdmin(@Body() body: any, @Request() req: any) {
        console.log('[Auth Debug] createAdmin called by:', req.user);
        console.log('[Auth Debug] Body:', body);

        // Simple role check
        if (req.user.role !== 'ADMIN') {
            console.log('[Auth Debug] Access Denied. User role:', req.user.role);
            throw new UnauthorizedException('Only Admins can create new Admins');
        }
        return this.authService.createAdmin(body);
    }

    @UseGuards(JwtAuthGuard)
    @Post('admin/team')
    // Note: Using POST purely for consistency if needed, but GET is more appropriate. 
    // However, looking at previous patterns, let's use GET as planned.
    @Get('admin/team')
    async getTeam(@Request() req: any) {
        if (req.user.role !== 'ADMIN') {
            throw new UnauthorizedException('Only Admins can view team members');
        }
        return this.authService.getTeamMembers();
    }

    @Get('ping')
    async ping() {
        return { message: 'pong', version: '2.1' };
    }
}
