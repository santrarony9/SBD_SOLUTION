import { Controller, Get, UseGuards } from '@nestjs/common';
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
}
