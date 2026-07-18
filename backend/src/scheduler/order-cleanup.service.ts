import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class OrderCleanupService {
  private readonly logger = new Logger(OrderCleanupService.name);

  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
  ) {}

  // Run every 30 minutes
  @Cron(CronExpression.EVERY_30_MINUTES)
  async releaseUnpaidStock() {
    this.logger.log('Checking for unpaid pending orders to release stock...');

    // Definition: PENDING orders older than 2 hours
    const deadline = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const pendingOrders = await this.prisma.order.findMany({
      where: {
        status: 'PENDING',
        paymentStatus: 'PENDING',
        createdAt: { lt: deadline },
      },
      include: {
        items: true,
      },
    });

    this.logger.log(`Found ${pendingOrders.length} unpaid orders for cleanup.`);

    for (const order of pendingOrders) {
      try {
        // 1. Restock Inventory
        await this.inventoryService.onOrderCancel(order.id);

        // 2. Mark Order as CANCELLED (System)
        await this.prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
          },
        });

        this.logger.log(
          `Automatically cancelled unpaid order ${order.id} and restored stock.`,
        );
      } catch (error) {
        this.logger.error(`Failed to cleanup order ${order.id}`, error);
      }
    }
  }
}
