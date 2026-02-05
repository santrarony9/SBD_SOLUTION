import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        try {
            // Basic validation: Max 10MB for now, support images, videos, and pdf
            const result = await this.mediaService.uploadFile(file);
            return {
                url: result.secure_url,
                public_id: result.public_id,
                resource_type: result.resource_type
            };
        } catch (error) {
            console.error('Upload Controller Error:', error);
            const message = error instanceof Error ? error.message : 'Unknown upload error';
            throw new Error(`Upload Failed: ${message}`);
        }
    }
}
