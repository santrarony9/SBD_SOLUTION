import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Request() req, @Body() body: { productId: string; rating: number; comment?: string }) {
        return this.reviewsService.create(req.user.userId, body);
    }

    @Get('product/:id')
    findByProduct(@Param('id') id: string) {
        return this.reviewsService.findByProduct(id);
    }
}
