const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = "mongodb+srv://santrarony9_db_user:v6glLNHcPlA9aEFb@cluster0.3hqsgsb.mongodb.net/spark_blue_diamond";
const client = new MongoClient(uri);
const backupDir = path.join(__dirname, 'backups', 'images');

function tryRestore(url) {
  if (!url || !url.includes('res.cloudinary.com')) return null;
  const fn = url.split('/').pop();
  if (fs.existsSync(path.join(backupDir, fn))) {
    return `/uploads/products/${fn}`;
  }
  return '';
}

async function run() {
  await client.connect();
  const db = client.db('spark_blue_diamond');

  // 1. Fix Offer imageUrls
  const offers = await db.collection('Offer').find({}).toArray();
  for (const o of offers) {
    if (o.imageUrl && o.imageUrl.includes('res.cloudinary.com')) {
      const restored = tryRestore(o.imageUrl);
      await db.collection('Offer').updateOne(
        { _id: o._id },
        { $set: { imageUrl: restored || '' } }
      );
      console.log(`Offer "${o.name}" imageUrl -> ${restored || '(cleared)'}`);
    }
  }

  // 2. Fix StoreSetting sparkblue_promise_cards
  const setting = await db.collection('StoreSetting').findOne({ key: 'sparkblue_promise_cards' });
  if (setting && setting.value && setting.value.includes('res.cloudinary.com')) {
    let cards = JSON.parse(setting.value);
    cards = cards.map(card => {
      if (card.image && card.image.includes('res.cloudinary.com')) {
        const restored = tryRestore(card.image);
        card.image = restored || '/default-jewel.jpg';
      }
      return card;
    });
    await db.collection('StoreSetting').updateOne(
      { _id: setting._id },
      { $set: { value: JSON.stringify(cards) } }
    );
    console.log('Fixed StoreSetting sparkblue_promise_cards');
  }

  // FINAL SCAN
  console.log('\n=== ABSOLUTE FINAL SCAN ===');
  const collections = await db.listCollections().toArray();
  let total = 0;
  for (const col of collections) {
    const docs = await db.collection(col.name).find({}).toArray();
    for (const doc of docs) {
      if (JSON.stringify(doc).includes('res.cloudinary.com')) {
        total++;
        console.log(`  STILL: ${col.name} -> ${doc.name || doc.title || doc.key || doc._id}`);
      }
    }
  }
  console.log(`\nTotal remaining Cloudinary references: ${total}`);
  if (total === 0) {
    console.log('DATABASE IS 100% CLEAN OF CLOUDINARY!');
  }

  await client.close();
}

run().catch(console.error);
