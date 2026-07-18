import { Injectable } from '@nestjs/common';
import { CloudinaryResponse } from './cloudinary-response';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class MediaService {
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'products',
  ): Promise<CloudinaryResponse> {
    if (!file || !file.buffer) {
      throw new Error('Invalid file provided to uploadFile');
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `${file.fieldname || 'file'}-${uniqueSuffix}${ext}`;

    // Use process.cwd() to resolve path from backend root, keeping it in /uploads/
    const uploadDir = path.join(process.cwd(), 'uploads', folder);

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, file.buffer);

    return {
      secure_url: `/uploads/${folder}/${filename}`,
      public_id: filename,
      resource_type: 'auto',
    };
  }

  async uploadBuffer(
    buffer: Buffer,
    folder: string = 'invoices',
  ): Promise<CloudinaryResponse> {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `document-${uniqueSuffix}.pdf`;

    const uploadDir = path.join(process.cwd(), 'uploads', folder);

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    return {
      secure_url: `/uploads/${folder}/${filename}`,
      public_id: filename,
      resource_type: 'auto',
    };
  }
}
