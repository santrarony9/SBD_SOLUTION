import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createOrder(@Request() req, @Body() body: { shippingAddress: any; paymentMethod: string }) {
        return this.ordersService.createOrder(req.user.userId, body.shippingAddress, body.paymentMethod);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getMyOrders(@Request() req) {
        return this.ordersService.getMyOrders(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('all')
    async getAllOrders() {
        // In a real app, check for ADMIN role in guard
        return this.ordersService.getAllOrders();
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/status')
    async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
        return this.ordersService.updateOrderStatus(id, body.status);
    }
}
