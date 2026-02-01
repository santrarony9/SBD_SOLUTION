import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { StoreService } from './store.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('store')
export class StoreController {
    constructor(private readonly storeService: StoreService) { }

    @Get('settings')
    async getAllSettings() {
        return this.storeService.getAllSettings();
    }

    @Get('settings/:key')
    async getSetting(@Param('key') key: string) {
        return this.storeService.getSetting(key);
    }

    @UseGuards(JwtAuthGuard)
    @Post('settings')
    async updateSetting(@Body() data: { key: string; value: any }) {
        return this.storeService.upsertSetting(data.key, data.value);
    }
}
