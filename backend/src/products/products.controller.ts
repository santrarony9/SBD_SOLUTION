import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN', 'PRICE_MANAGER')
    create(@Body() createProductDto: any) {
        return this.productsService.createProduct(createProductDto);
    }



    @Post('ai-description')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN', 'PRICE_MANAGER')
    async generateDescription(@Body() body: any) {
        const description = await this.productsService.generateDescription(body);
        return { description };
    }

    @Get()
    findAll(
        @Query('category') category?: string,
        @Query('tag') tag?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
    ) {
        return this.productsService.findAll({
            category,
            tag,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN', 'PRICE_MANAGER')
    update(@Param('id') id: string, @Body() updateProductDto: any) {
        return this.productsService.updateProduct(id, updateProductDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN')
    remove(@Param('id') id: string) {
        return this.productsService.deleteProduct(id);
    }
}
