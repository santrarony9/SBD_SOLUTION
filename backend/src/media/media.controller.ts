import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit for Multer parsing
  }))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }), // 20MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp|gif)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    try {
      const result = await this.mediaService.uploadFile(file);
      return {
        url: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type,
      };
    } catch (error) {
      console.error('Upload Controller Error:', error);
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw new InternalServerErrorException(`Upload Failed: ${message}`);
    }
  }

  @Post('upload-video')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB
          new FileTypeValidator({ fileType: '.(mp4|webm|quicktime|mov)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    try {
      const result = await this.mediaService.uploadFile(file, 'video-showcase');
      return {
        url: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type,
      };
    } catch (error) {
      console.error('Video Upload Error:', error);
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw new Error(`Video Upload Failed: ${message}`);
    }
  }


  @Post('upload-local')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/videos',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadLocalFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB
          new FileTypeValidator({ fileType: '.(mp4|webm|quicktime|mov)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        throw new Error('No file uploaded');
      }
      
      // Return the URL that will be accessible via the ServeStatic module config
      const fileUrl = `/uploads/videos/${file.filename}`;
      
      return {
        url: fileUrl,
        public_id: file.filename,
        resource_type: 'video', // Assume video primarily for this endpoint
      };
    } catch (error) {
      console.error('Local Upload Controller Error:', error);
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw new Error(`Local Upload Failed: ${message}`);
    }
  }
}
