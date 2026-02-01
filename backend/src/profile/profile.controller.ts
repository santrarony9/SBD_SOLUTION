import { Controller, Get, Patch, Post, Delete, Body, UseGuards, Request, Param, ParseIntPipe } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
    constructor(private profileService: ProfileService) { }

    @Get()
    getProfile(@Request() req) {
        return this.profileService.getProfile(req.user.userId);
    }

    @Patch()
    updateProfile(@Request() req, @Body() body: { name?: string; mobile?: string }) {
        return this.profileService.updateProfile(req.user.userId, body);
    }

    @Post('addresses')
    addAddress(@Request() req, @Body() address: any) {
        return this.profileService.addAddress(req.user.userId, address);
    }

    @Delete('addresses/:index')
    removeAddress(@Request() req, @Param('index', ParseIntPipe) index: number) {
        return this.profileService.removeAddress(req.user.userId, index);
    }

    @Post('change-password')
    changePassword(@Request() req, @Body() body: any) {
        return this.profileService.changePassword(
            req.user.userId,
            body.oldPassword,
            body.newPassword,
        );
    }
}
