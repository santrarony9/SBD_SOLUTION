const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://santrarony9_db_user:v6glLNHcPlA9aEFb@cluster0.3hqsgsb.mongodb.net/spark_blue_diamond?appName=Cluster0";
const client = new MongoClient(uri);

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
          if (img.startsWith('https://sparkbluediamond.com/uploads/products/')) {
            const filename = img.split('/').pop();
            newImages.push(`/uploads/products/${filename}`);
            changed = true;
          } else {
            newImages.push(img);
          }
        }
      }
      
      let newImage = p.image;
      if (newImage && newImage.startsWith('https://sparkbluediamond.com/uploads/products/')) {
        const filename = newImage.split('/').pop();
        newImage = `/uploads/products/${filename}`;
        changed = true;
      }
      
      let newCoverImage = p.coverImage;
      if (newCoverImage && newCoverImage.startsWith('https://sparkbluediamond.com/uploads/products/')) {
        const filename = newCoverImage.split('/').pop();
        newCoverImage = `/uploads/products/${filename}`;
        changed = true;
      }
      
      if (changed) {
        await db.collection('Product').updateOne(
          { _id: p._id },
          { $set: { images: newImages, image: newImage, coverImage: newCoverImage } }
        );
        updatedProducts++;
      }
    }
    
    console.log(`Updated ${updatedProducts} products.`);
    
    // 2. Update Gallery
    const gallery = await db.collection('GalleryItem').find({}).toArray();
    let updatedGallery = 0;
    for (const g of gallery) {
      if (g.imageUrl && g.imageUrl.startsWith('https://sparkbluediamond.com/uploads/products/')) {
        const filename = g.imageUrl.split('/').pop();
        await db.collection('GalleryItem').updateOne(
          { _id: g._id },
          { $set: { imageUrl: `/uploads/products/${filename}` } }
        );
        updatedGallery++;
      }
    }
    console.log(`Updated ${updatedGallery} gallery items.`);
    
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
