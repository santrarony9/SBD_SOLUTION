import { Controller, Get, Post, Body, UseGuards, Request, Param, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createOrder(@Request() req, @Body() body: {
        shippingAddress: any;
        paymentMethod: string;
        billingAddress?: any;
        isB2B?: boolean;
        customerGSTIN?: string;
        businessName?: string;
        placeOfSupply?: string;
    }) {
        return this.ordersService.createOrder(
            req.user.userId,
            body.shippingAddress,
            body.paymentMethod,
            body.billingAddress,
            body.isB2B,
            body.customerGSTIN,
            body.businessName,
            body.placeOfSupply
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getMyOrders(@Request() req) {
        return this.ordersService.getMyOrders(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('all')
    async getAllOrders(
        @Query('status') status?: string,
        @Query('search') search?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        // In a real app, check for ADMIN role in guard
        return this.ordersService.getAllOrders(
            status,
            search,
            page ? Number(page) : 1,
            limit ? Number(limit) : 20,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/status')
    async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
        return this.ordersService.updateOrderStatus(id, body.status);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/shiprocket')
    async pushToShiprocket(@Param('id') id: string) {
        // Logic Updated: This now acts as a "Sync & Ship" trigger
        return this.ordersService.shipOrder(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id/label')
    async getShipmentLabel(@Param('id') id: string) {
        return this.ordersService.generateShipmentLabel(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('shiprocket/test')
    async testShiprocket() {
        return this.ordersService.testShiprocketAuth();
    }

    @Get('public/recent')
    async getPublicRecentOrders() {
        return this.ordersService.getPublicRecentOrders();
    }
}
