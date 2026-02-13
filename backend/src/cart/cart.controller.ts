import { Controller, Get, Post, Patch, Body, Delete, Param, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    // Get Cart (Protected for now, ideally supports Guest via Session ID later)
    @UseGuards(JwtAuthGuard)
    @Get()
    async getCart(@Request() req) {
        return this.cartService.getCart(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('items')
    async addToCart(@Request() req, @Body() body: { productId: string; quantity: number }) {
        return this.cartService.addToCart(req.user.userId, body.productId, body.quantity);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('items/:itemId')
    async updateCartItem(@Request() req, @Param('itemId') itemId: string, @Body() body: { quantity: number }) {
        return this.cartService.updateCartItem(req.user.userId, itemId, body.quantity);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('items/:itemId')
    async removeFromCart(@Request() req, @Param('itemId') itemId: string) {
        // Validate ownership logic could go here
        return this.cartService.removeFromCart(req.user.userId, itemId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete()
    async clearCart(@Request() req) {
        return this.cartService.clearCart(req.user.userId);
    }
}
