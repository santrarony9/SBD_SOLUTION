import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
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
}
