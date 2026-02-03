import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { CloudinaryProvider } from './cloudinary.provider';
import { MediaController } from './media.controller';

@Module({
    providers: [CloudinaryProvider, MediaService],
    controllers: [MediaController],
    exports: [CloudinaryProvider, MediaService],
})
export class MediaModule { }
