import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { GalleryService } from './gallery.service';

@Controller('gallery')
export class GalleryController {
    constructor(private readonly galleryService: GalleryService) { }

    @Get()
    findAll() {
        return this.galleryService.findAll();
    }

    @Post()
    create(@Body() data: any) {
        return this.galleryService.create(data);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.galleryService.update(id, data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.galleryService.remove(id);
    }
}
