import { Controller, Get, Post, Body, UseGuards, Request, Delete, Param } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wishlist')
export class WishlistController {
    constructor(private readonly wishlistService: WishlistService) { }

    @UseGuards(JwtAuthGuard)
    @Post('toggle')
    toggle(@Request() req, @Body() body: { productId: string }) {
        return this.wishlistService.toggleWishlist(req.user.userId, body.productId);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(@Request() req) {
        return this.wishlistService.getWishlist(req.user.userId);
    }
}
