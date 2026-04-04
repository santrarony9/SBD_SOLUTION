import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { VideoShowcaseService } from './video-showcase.service';

@Controller('video-showcase')
export class VideoShowcaseController {
  constructor(private readonly videoShowcaseService: VideoShowcaseService) {}

  @Get()
  findAll() {
    return this.videoShowcaseService.findAll();
  }

  @Post()
  create(@Body() data: any) {
    return this.videoShowcaseService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.videoShowcaseService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.videoShowcaseService.remove(id);
  }
}
