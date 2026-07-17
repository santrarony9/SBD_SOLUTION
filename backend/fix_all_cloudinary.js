const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = "mongodb+srv://santrarony9_db_user:v6glLNHcPlA9aEFb@cluster0.3hqsgsb.mongodb.net/spark_blue_diamond";
const client = new MongoClient(uri);

async function run() {
  await client.connect();
  const db = client.db('spark_blue_diamond');
  
  // Fix banners - clear dead Cloudinary URLs so they fall back to hero-jewellery.png
  const banners = await db.collection('Banner').find({}).toArray();
  let fixed = 0;
  for (const b of banners) {
    if (b.imageUrl && b.imageUrl.includes('res.cloudinary.com')) {
      const fn = b.imageUrl.split('/').pop();
      const inBackup = fs.existsSync(path.join(__dirname, 'backups', 'images', fn));
      
      if (inBackup) {
        // Restore from backup
        await db.collection('Banner').updateOne(
          { _id: b._id },
          { $set: { imageUrl: `/uploads/products/${fn}` } }
        );
        console.log(`[RESTORED] Banner "${b.title}" -> /uploads/products/${fn}`);
      } else {
        // Clear the dead URL so frontend falls back to default
        await db.collection('Banner').updateOne(
          { _id: b._id },
          { $set: { imageUrl: '' } }
        );
        console.log(`[CLEARED] Banner "${b.title}" (image not in backup)`);
      }
      fixed++;
    }
  }
  console.log(`\nFixed ${fixed} banners.`);

  // Also check categories
  const categories = await db.collection('Category').find({}).toArray();
  let catFixed = 0;
  for (const cat of categories) {
    let changed = false;
    const updates = {};
    
    for (const field of ['imageUrl', 'image']) {
      if (cat[field] && cat[field].includes('res.cloudinary.com')) {
        const fn = cat[field].split('/').pop();
        const inBackup = fs.existsSync(path.join(__dirname, 'backups', 'images', fn));
        if (inBackup) {
          updates[field] = `/uploads/products/${fn}`;
          console.log(`[RESTORED] Category "${cat.name}" ${field} -> /uploads/products/${fn}`);
        } else {
          updates[field] = '';
          console.log(`[CLEARED] Category "${cat.name}" ${field} (image not in backup)`);
        }
        changed = true;
      }
    }
    
    if (changed) {
      await db.collection('Category').updateOne({ _id: cat._id }, { $set: updates });
      catFixed++;
    }
  }
  console.log(`Fixed ${catFixed} categories.`);

  // Check VideoShowcase
  const videos = await db.collection('VideoShowcase').find({}).toArray();
  let vidFixed = 0;
  for (const v of videos) {
    let updates = {};
    let changed = false;
    
    if (v.thumbnailUrl && v.thumbnailUrl.includes('res.cloudinary.com')) {
      const fn = v.thumbnailUrl.split('/').pop();
      const inBackup = fs.existsSync(path.join(__dirname, 'backups', 'images', fn));
      updates.thumbnailUrl = inBackup ? `/uploads/products/${fn}` : '';
      changed = true;
    }
    if (v.videoUrl && v.videoUrl.includes('res.cloudinary.com')) {
      updates.videoUrl = ''; // Videos won't be in image backup
      changed = true;
    }
    
    if (changed) {
      await db.collection('VideoShowcase').updateOne({ _id: v._id }, { $set: updates });
      vidFixed++;
      console.log(`[FIXED] VideoShowcase "${v.title}"`);
    }
  }
  console.log(`Fixed ${vidFixed} video showcases.`);

  // Final verification
  console.log('\n=== FINAL VERIFICATION ===');
  const allCollections = ['Product', 'GalleryItem', 'Banner', 'Category', 'VideoShowcase'];
  for (const col of allCollections) {
    const docs = await db.collection(col).find({}).toArray();
    let cloudCount = 0;
    for (const doc of docs) {
      const json = JSON.stringify(doc);
      if (json.includes('res.cloudinary.com')) cloudCount++;
    }
    console.log(`${col}: ${cloudCount} docs still have Cloudinary URLs`);
  }

  await client.close();
}

run().catch(console.error);
