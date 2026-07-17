const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

const uri = "mongodb+srv://santrarony9_db_user:v6glLNHcPlA9aEFb@cluster0.3hqsgsb.mongodb.net/spark_blue_diamond?appName=Cluster0";
const client = new MongoClient(uri);

async function uploadFileToLiveAPI(filename) {
    const backupDir = path.join(__dirname, 'backups', 'images');
    const filePath = path.join(backupDir, filename);
    
    if (!fs.existsSync(filePath)) {
        console.log(`[SKIP] File not found in backup: ${filename}`);
        return null;
    }

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    try {
        const response = await fetch('https://api.sparkbluediamond.com/api/media/upload', {
            method: 'POST',
            body: form
        });
        
        if (!response.ok) {
            console.error(`[ERROR] Upload failed for ${filename}: ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        return data.url; // This will be the new /uploads/products/file-123.jpg
    } catch (error) {
        console.error(`[ERROR] Exception uploading ${filename}:`, error.message);
        return null;
    }
}

function extractOriginalFilename(url) {
    if (!url) return null;
    return url.split('/').pop();
}

async function run() {
    try {
        await client.connect();
        const db = client.db('spark_blue_diamond');
        
        // 1. Update Products
        const products = await db.collection('Product').find({}).toArray();
        let updatedProducts = 0;
        
        for (const p of products) {
            let changed = false;
            let newImages = [];
            
            if (p.images && Array.isArray(p.images)) {
                for (const img of p.images) {
                    if (img.includes('res.cloudinary.com') || img.includes('sparkbluediamond.com/uploads')) {
                        const filename = extractOriginalFilename(img);
                        const newUrl = await uploadFileToLiveAPI(filename);
                        if (newUrl) {
                            newImages.push(newUrl);
                            changed = true;
                        } else {
                            newImages.push(img); // Keep original if upload fails
                        }
                    } else {
                        newImages.push(img);
                    }
                }
            }
            
            let newImage = p.image;
            if (newImage && (newImage.includes('res.cloudinary.com') || newImage.includes('sparkbluediamond.com/uploads'))) {
                const filename = extractOriginalFilename(newImage);
                const newUrl = await uploadFileToLiveAPI(filename);
                if (newUrl) {
                    newImage = newUrl;
                    changed = true;
                }
            }
            
            let newCoverImage = p.coverImage;
            if (newCoverImage && (newCoverImage.includes('res.cloudinary.com') || newCoverImage.includes('sparkbluediamond.com/uploads'))) {
                const filename = extractOriginalFilename(newCoverImage);
                const newUrl = await uploadFileToLiveAPI(filename);
                if (newUrl) {
                    newCoverImage = newUrl;
                    changed = true;
                }
            }
            
            if (changed) {
                await db.collection('Product').updateOne(
                    { _id: p._id },
                    { $set: { images: newImages, image: newImage, coverImage: newCoverImage } }
                );
                updatedProducts++;
                console.log(`[OK] Updated product: ${p.name}`);
            }
        }
        
        console.log(`Finished updating ${updatedProducts} products.`);
        
        // 2. Update Gallery
        const gallery = await db.collection('GalleryItem').find({}).toArray();
        let updatedGallery = 0;
        for (const g of gallery) {
            if (g.imageUrl && (g.imageUrl.includes('res.cloudinary.com') || g.imageUrl.includes('sparkbluediamond.com/uploads'))) {
                const filename = extractOriginalFilename(g.imageUrl);
                const newUrl = await uploadFileToLiveAPI(filename);
                if (newUrl) {
                    await db.collection('GalleryItem').updateOne(
                        { _id: g._id },
                        { $set: { imageUrl: newUrl } }
                    );
                    updatedGallery++;
                    console.log(`[OK] Updated gallery item: ${g.title}`);
                }
            }
        }
        console.log(`Finished updating ${updatedGallery} gallery items.`);
        
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
