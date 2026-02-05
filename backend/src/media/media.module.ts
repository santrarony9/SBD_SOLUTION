import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MediaService } from './media.service';
import { CloudinaryProvider } from './cloudinary.provider';
import { MediaController } from './media.controller';

@Module({
    imports: [
        MulterModule.register({
            storage: memoryStorage(),
        }),
    ],
    providers: [CloudinaryProvider, MediaService],
    controllers: [MediaController],
    exports: [CloudinaryProvider, MediaService],
})
export class MediaModule { }
