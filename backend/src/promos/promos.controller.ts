import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PromosService } from './promos.service';

@Controller('promos')
export class PromosController {
    constructor(private readonly promosService: PromosService) { }

    @Post()
    async create(@Body() body: any) {
        return this.promosService.create(body);
    }

    @Get()
    async findAll() {
        return this.promosService.findAll();
    }

    @Post('validate')
    async validate(@Body() body: { code: string }) {
        return this.promosService.validate(body.code);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.promosService.delete(id);
    }
}
