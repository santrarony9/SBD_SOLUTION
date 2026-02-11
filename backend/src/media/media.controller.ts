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
    async uploadFile(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
                    // new FileTypeValidator({ fileType: '.(png|jpeg|jpg|pdf|mp4)' }), // Optional: Strict type check
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        try {
            // Validation passed
            const result = await this.mediaService.uploadFile(file);
            return {
                url: result.secure_url,
                public_id: result.public_id,
                resource_type: result.resource_type
            };
        } catch (error) {
            console.error('Upload Controller Error:', error);
            const message = error instanceof Error
                ? error.message
                : JSON.stringify(error); // Capture Cloudinary object errors
            throw new Error(`Upload Failed: ${message}`);
        }
    }
}
