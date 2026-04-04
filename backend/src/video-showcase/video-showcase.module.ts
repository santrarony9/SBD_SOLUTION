import { Module } from '@nestjs/common';
import { VideoShowcaseService } from './video-showcase.service';
import { VideoShowcaseController } from './video-showcase.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [VideoShowcaseController],
  providers: [VideoShowcaseService, PrismaService],
})
export class VideoShowcaseModule {}
