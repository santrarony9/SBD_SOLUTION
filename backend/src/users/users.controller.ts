import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    create(@Request() req: any, @Body() createUserDto: any) {
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            throw new UnauthorizedException('Only Admins can create users');
        }
        return this.usersService.create(createUserDto);
    }

    @Get()
    findAll(@Request() req: any) {
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            throw new UnauthorizedException('Only Admins can view users');
        }
        return this.usersService.findAll();
    }

    @Delete(':id')
    async remove(@Request() req: any, @Param('id') id: string) {
        const currentUserRole = req.user.role;
        if (currentUserRole !== 'ADMIN' && currentUserRole !== 'SUPER_ADMIN') {
            throw new UnauthorizedException('Only Admins can delete users');
        }

        const currentUserId = req.user.sub || req.user.id || req.user.userId;

        if (currentUserId === id) {
            throw new UnauthorizedException('You cannot delete your own account');
        }

        // Fetch target user to check their role
        const targetUser = await this.usersService.findById(id);
        if (!targetUser) {
            throw new UnauthorizedException('User not found');
        }

        // Hierarchy Logic:
        // 1. SUPER_ADMIN is invincible (cannot be deleted).
        // 2. ADMIN cannot delete another ADMIN or SUPER_ADMIN.
        // 3. Only SUPER_ADMIN can delete an ADMIN.

        if (targetUser.role === 'SUPER_ADMIN') {
            throw new UnauthorizedException('The Super Admin account is protected and cannot be deleted');
        }

        if (currentUserRole === 'ADMIN' && targetUser.role === 'ADMIN') {
            throw new UnauthorizedException('Administrators cannot delete other administrators. Only a Super Admin can perform this action.');
        }

        return this.usersService.remove(id);
    }
}
