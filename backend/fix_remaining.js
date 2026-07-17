const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = "mongodb+srv://santrarony9_db_user:v6glLNHcPlA9aEFb@cluster0.3hqsgsb.mongodb.net/spark_blue_diamond";
const client = new MongoClient(uri);
const backupDir = path.join(__dirname, 'backups', 'images');

function tryRestore(url) {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  const fn = url.split('/').pop();
  if (fs.existsSync(path.join(backupDir, fn))) {
    return `/uploads/products/${fn}`;
  }
  return ''; // Clear dead URLs
}

async function run() {
  await client.connect();
  const db = client.db('spark_blue_diamond');

  // 1. Fix Product certificatePdf and videoUrl
  const products = await db.collection('Product').find({}).toArray();
  let prodFixed = 0;
  for (const p of products) {
    const updates = {};
    let changed = false;

    if (p.certificatePdf && p.certificatePdf.includes('res.cloudinary.com')) {
      updates.certificatePdf = tryRestore(p.certificatePdf);
      changed = true;
    }
    if (p.videoUrl && p.videoUrl.includes('res.cloudinary.com')) {
      updates.videoUrl = ''; // Videos not in image backup
      changed = true;
    }

    if (changed) {
      await db.collection('Product').updateOne({ _id: p._id }, { $set: updates });
      prodFixed++;
    }
  }
  console.log(`Fixed ${prodFixed} products (certificatePdf/videoUrl).`);

  // 2. Fix Banner mobileImageUrl
  const banners = await db.collection('Banner').find({}).toArray();
  let banFixed = 0;
  for (const b of banners) {
    if (b.mobileImageUrl && b.mobileImageUrl.includes('res.cloudinary.com')) {
      const restored = tryRestore(b.mobileImageUrl);
      await db.collection('Banner').updateOne(
        { _id: b._id },
        { $set: { mobileImageUrl: restored } }
      );
      console.log(`Banner "${b.title}" mobileImageUrl -> ${restored || '(cleared)'}`);
      banFixed++;
    }
  }
  console.log(`Fixed ${banFixed} banner mobileImageUrls.`);

  // 3. Final verification - scan ALL collections for any remaining cloudinary
  console.log('\n=== FINAL FULL SCAN ===');
  const collections = await db.listCollections().toArray();
  let totalRemaining = 0;
  for (const col of collections) {
    const docs = await db.collection(col.name).find({}).toArray();
    for (const doc of docs) {
      const json = JSON.stringify(doc);
      if (json.includes('res.cloudinary.com')) {
        totalRemaining++;
        // Find which field
        for (const [k, v] of Object.entries(doc)) {
          if (JSON.stringify(v).includes('res.cloudinary.com')) {
            console.log(`  [REMAINING] ${col.name} -> ${doc.name || doc.title || doc._id} -> ${k}`);
          }
        }
      }
    }
  }
  console.log(`\nTotal documents still referencing Cloudinary: ${totalRemaining}`);

  await client.close();
}

run().catch(console.error);
