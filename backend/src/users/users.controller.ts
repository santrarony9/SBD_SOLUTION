import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    create(@Request() req: any, @Body() createUserDto: any) {
        if (req.user.role !== 'ADMIN') {
            throw new UnauthorizedException('Only Admins can create users');
        }
        return this.usersService.create(createUserDto);
    }

    @Get()
    findAll(@Request() req: any) {
        if (req.user.role !== 'ADMIN') {
            throw new UnauthorizedException('Only Admins can view users');
        }
        return this.usersService.findAll();
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        if (req.user.role !== 'ADMIN') {
            throw new UnauthorizedException('Only Admins can delete users');
        }
        const currentUserId = req.user.sub || req.user.id || req.user.userId;
        if (currentUserId === id) {
            throw new UnauthorizedException('You cannot delete your own account');
        }
        return this.usersService.remove(id);
    }
}
