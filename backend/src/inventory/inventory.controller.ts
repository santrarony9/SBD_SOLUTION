import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
    constructor(private inventory: InventoryService) { }

    @Get('valuation')
    getValuation() {
        return this.inventory.getInventoryValuation();
    }

    @Get('vaults')
    getVaults() {
        return this.inventory.getVaults();
    }

    @Post('adjust')
    adjustStock(
        @Body() body: { productId: string, quantity: number, action: string, reason?: string },
        @Request() req: any
    ) {
        return this.inventory.adjustStock(body.productId, body.quantity, body.action, body.reason, req.user.id);
    }

    @Post('material')
    updateMaterial(@Body() body: { type: string, quantity: number, unit: string }) {
        return this.inventory.updateMaterialStock(body.type, body.quantity, body.unit);
    }

    @Post('vault')
    createVault(@Body() body: { name: string, location: string }) {
        return this.inventory.createVault(body.name, body.location);
    }
}
