import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    create(@Body() createProductDto: any) {
        return this.productsService.createProduct(createProductDto);
    }

    @Post('seed-pricing')
    async seedPricingPost() {
        return this.productsService.seedPricing();
    }

    @Get('seed-pricing')
    async seedPricingGet() {
        return this.productsService.seedPricing();
    }

    @Post('ai-description')
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
    update(@Param('id') id: string, @Body() updateProductDto: any) {
        return this.productsService.updateProduct(id, updateProductDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.productsService.deleteProduct(id);
    }
}
