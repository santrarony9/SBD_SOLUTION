import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
import * as streamifier from 'streamifier';

@Injectable()
export class MediaService {
    uploadFile(file: Express.Multer.File, folder: string = 'products'): Promise<CloudinaryResponse> {
        return new Promise<CloudinaryResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: 'auto', // Important for videos/pdfs
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                },
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }

    uploadBuffer(buffer: Buffer, folder: string = 'invoices'): Promise<CloudinaryResponse> {
        return new Promise<CloudinaryResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                },
            );

            streamifier.createReadStream(buffer).pipe(uploadStream);
        });
    }
}
