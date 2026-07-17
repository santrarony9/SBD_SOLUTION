const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://santrarony9_db_user:v6glLNHcPlA9aEFb@cluster0.3hqsgsb.mongodb.net/spark_blue_diamond";
const client = new MongoClient(uri);

async function run() {
  await client.connect();
  const db = client.db('spark_blue_diamond');

  // Fix sparkblue_promise_cards (double-encoded JSON string)
  const s = await db.collection('StoreSetting').findOne({ key: 'sparkblue_promise_cards' });
  if (s) {
    let val = s.value;
    // Parse until we get an array
    while (typeof val === 'string') {
      val = JSON.parse(val);
    }
    val = val.map(card => {
      if (card.image && card.image.includes('res.cloudinary.com')) {
        card.image = '/default-jewel.jpg';
      }
      return card;
    });
    await db.collection('StoreSetting').updateOne(
      { _id: s._id },
      { $set: { value: JSON.stringify(val) } }
    );
    console.log('Fixed sparkblue_promise_cards');
  }

  // Final absolute scan
  const cols = await db.listCollections().toArray();
  let total = 0;
  for (const col of cols) {
    const docs = await db.collection(col.name).find({}).toArray();
    for (const doc of docs) {
      if (JSON.stringify(doc).includes('res.cloudinary.com')) {
        total++;
        console.log(`REMAINING: ${col.name} -> ${doc.name || doc.title || doc.key || doc._id}`);
      }
    }
  }

  if (total === 0) {
    console.log('\n*** DATABASE IS 100% CLEAN OF CLOUDINARY ***');
  } else {
    console.log(`\nStill ${total} documents with Cloudinary references.`);
  }

  await client.close();
}

run().catch(console.error);
