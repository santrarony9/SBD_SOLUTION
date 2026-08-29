const { v2: cloudinary } = require('cloudinary');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const prisma = new PrismaClient();

async function uploadVideo(filePath) {
    console.log(`Uploading ${filePath} to Cloudinary...`);
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(filePath, { 
            resource_type: "video", 
            folder: "video-showcase" 
        }, (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
        });
    });
}

async function main() {
    try {
        console.log("Starting upload process...");
        
        // Ensure old videos are cleared (if any ghosts remain, though API said 0)
        await prisma.videoShowcase.deleteMany({});

        const url1 = await uploadVideo('../video1.mp4');
        console.log("Video 1 URL:", url1);
        await prisma.videoShowcase.create({
            data: { title: 'Timeless Beauty', tagline: 'DISCOVER', videoUrl: url1, order: 1 }
        });

        const url2 = await uploadVideo('../video2.mp4');
        console.log("Video 2 URL:", url2);
        await prisma.videoShowcase.create({
            data: { title: 'Craftsmanship', tagline: 'OUR PROCESS', videoUrl: url2, order: 2 }
        });

        const url3 = await uploadVideo('../video3.mp4');
        console.log("Video 3 URL:", url3);
        await prisma.videoShowcase.create({
            data: { title: 'The Royal Standard', tagline: 'LUXURY', videoUrl: url3, order: 3 }
        });

        console.log("All videos uploaded and saved to DB successfully!");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
