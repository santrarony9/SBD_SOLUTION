import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
    provide: 'CLOUDINARY',
    useFactory: () => {
        const config = {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        };
        if (!config.cloud_name || !config.api_key || !config.api_secret) {
            console.warn('⚠️ Cloudinary config missing! Check CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET.');
        }
        return cloudinary.config(config);
    },
};
