import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { CrmService } from './crm.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('crm')
@UseGuards(JwtAuthGuard)
export class CrmController {
  constructor(
    private crm: CrmService,
    private prisma: PrismaService,
  ) {}

  // User: Get Personal Loyalty Portfolio
  @Get('portfolio')
  async getPortfolio(@Request() req: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        loyaltyPoints: true,
        lifetimeSpend: true,
        tier: true,
        birthday: true,
        anniversaryDate: true,
        loyaltyLogs: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    return user;
  }

  // Admin: Get Customer Insights
  @Get('customers')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getCustomers() {
    return this.prisma.user.findMany({
      where: { role: 'USER' },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        tier: true,
        lifetimeSpend: true,
        loyaltyPoints: true,
        crmNotes: true,
      },
      orderBy: { lifetimeSpend: 'desc' },
    });
  }

  // Admin: Add Note
  @Post('notes/:userId')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async addNote(
    @Param('userId') userId: string,
    @Body() body: { notes: string },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { crmNotes: body.notes },
    });
  }

  // Admin: Edit Customer Profile
  @Put('customers/:id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async updateCustomer(@Param('id') id: string, @Body() body: any) {
    return this.prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        mobile: body.mobile,
        tier: body.tier,
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        tier: true,
        lifetimeSpend: true,
        loyaltyPoints: true,
        crmNotes: true,
      },
    });
  }

  // Admin: Adjust Points
  @Post('adjust-points')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async adjustPoints(
    @Body() body: { userId: string; points: number; reason: string },
  ) {
    return this.crm.adjustPoints(body.userId, body.points, body.reason);
  }
}
