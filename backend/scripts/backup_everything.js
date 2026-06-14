const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const https = require('https');

const prisma = new PrismaClient();
const backupDir = path.join(__dirname, '..', 'backups');
const imagesDir = path.join(backupDir, 'images');

if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

async function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(imagesDir, filename);
        if (fs.existsSync(filePath)) return resolve(); // Skip if already downloaded

        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                console.error(`Failed to download ${url}: ${res.statusCode}`);
                return resolve(); // Resolve anyway to continue
            }
            const fileStream = fs.createWriteStream(filePath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
        }).on('error', (err) => {
            console.error(`Error downloading ${url}:`, err.message);
            resolve();
        });
    });
}

function extractFilename(url) {
    try {
        const parts = new URL(url).pathname.split('/');
        return parts[parts.length - 1];
    } catch(e) {
        return `backup_${Date.now()}.jpg`;
    }
}

async function backup() {
    console.log('Starting Full Database & Image Backup...');

    // 1. Backup Products
    const products = await prisma.product.findMany();
    fs.writeFileSync(path.join(backupDir, 'products.json'), JSON.stringify(products, null, 2));
    console.log(`Backed up ${products.length} products to JSON.`);

    // 2. Backup Categories
    const categories = await prisma.category.findMany();
    fs.writeFileSync(path.join(backupDir, 'categories.json'), JSON.stringify(categories, null, 2));
    console.log(`Backed up ${categories.length} categories to JSON.`);

    // 3. Backup Banners
    const banners = await prisma.banner.findMany();
    fs.writeFileSync(path.join(backupDir, 'banners.json'), JSON.stringify(banners, null, 2));
    console.log(`Backed up ${banners.length} banners to JSON.`);

    // 4. Download all Product Images
    console.log('Starting image downloads...');
    let count = 0;
    for (const p of products) {
        const urls = [...p.images];
        if (p.coverImage) urls.push(p.coverImage);
        
        for (const url of urls) {
            if (url && url.includes('res.cloudinary.com')) {
                const filename = extractFilename(url);
                await downloadImage(url, filename);
                count++;
            }
        }
    }
    console.log(`Successfully downloaded ${count} images from Cloudinary.`);
    console.log('Backup complete! Files are saved in backend/backups/');
}

backup().catch(console.error).finally(() => prisma.$disconnect());
