import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { BannerService } from './banner.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('banners')
export class BannerController {
    constructor(private readonly bannerService: BannerService) { }

    @Get()
    async findAll() {
        return this.bannerService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() data: any) {
        return this.bannerService.create(data);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Param('id') id: string, @Body() data: any) {
        return this.bannerService.update(id, data);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.bannerService.delete(id);
    }
}
