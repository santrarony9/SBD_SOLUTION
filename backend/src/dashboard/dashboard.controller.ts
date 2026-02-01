import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { AdminGuard } from '../auth/admin.guard'; // Ideally protect this

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @UseGuards(JwtAuthGuard)
    @Get('stats')
    async getStats() {
        return this.dashboardService.getStats();
    }

    @UseGuards(JwtAuthGuard)
    @Get('carts')
    async getActiveCarts() {
        return this.dashboardService.getActiveCarts();
    }

    @UseGuards(JwtAuthGuard)
    @Get('carts/:id/nudge') // Changed to Get for easier testing, or Post
    async nudgeCart(@Param('id') id: string) {
        return this.dashboardService.nudgeCart(id);
    }
}
