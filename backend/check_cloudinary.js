const https = require('https');
const { MongoClient } = require('mongodb');

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

async function main() {
  // 1. Check what the DB currently has
  const client = new MongoClient('mongodb+srv://santrarony9_db_user:v6glLNHcPlA9aEFb@cluster0.3hqsgsb.mongodb.net/spark_blue_diamond');
  await client.connect();
  const db = client.db('spark_blue_diamond');

  const products = await db.collection('Product').find({}).toArray();
  let cloudinaryCount = 0;
  let localCount = 0;
  let otherCount = 0;

  for (const p of products) {
    const allUrls = [...(p.images || []), p.image, p.coverImage].filter(Boolean);
    for (const url of allUrls) {
      if (url.includes('res.cloudinary.com')) cloudinaryCount++;
      else if (url.startsWith('/uploads/')) localCount++;
      else otherCount++;
    }
  }

  console.log('\n=== DATABASE STATE ===');
  console.log(`Total products: ${products.length}`);
  console.log(`Cloudinary URLs remaining: ${cloudinaryCount}`);
  console.log(`Local /uploads/ URLs: ${localCount}`);
  console.log(`Other URLs: ${otherCount}`);

  // Show products that still have cloudinary URLs
  const cloudinaryProducts = products.filter(p => {
    const allUrls = [...(p.images || []), p.image, p.coverImage].filter(Boolean);
    return allUrls.some(u => u.includes('res.cloudinary.com'));
  });
  
  if (cloudinaryProducts.length > 0) {
    console.log(`\nProducts still referencing Cloudinary: ${cloudinaryProducts.length}`);
    cloudinaryProducts.slice(0, 3).forEach(p => {
      console.log(`  - ${p.name}: ${p.certificatePdf || 'no cert'}`);
    });
  }

  // Check gallery
  const gallery = await db.collection('GalleryItem').find({}).toArray();
  const cloudGallery = gallery.filter(g => g.imageUrl && g.imageUrl.includes('res.cloudinary.com'));
  const localGallery = gallery.filter(g => g.imageUrl && g.imageUrl.startsWith('/uploads/'));
  console.log(`\nGallery items: ${gallery.length}`);
  console.log(`  Cloudinary: ${cloudGallery.length}`);
  console.log(`  Local: ${localGallery.length}`);

  // Check banners
  const banners = await db.collection('Banner').find({}).toArray();
  console.log(`\nBanners: ${banners.length}`);
  for (const b of banners) {
    console.log(`  - ${b.title}: ${b.imageUrl || b.image || 'no url'}`);
  }

  await client.close();

  // 2. Check if frontend normalizeImageUrl is actually working
  console.log('\n=== LIVE SITE CHECK ===');
  const html = await fetchPage('https://sparkbluediamond.com/');
  
  // Check for cloudinary in img src attributes
  const imgSrcs = html.match(/src="[^"]*cloudinary[^"]*"/g) || [];
  console.log(`<img> tags with cloudinary src: ${imgSrcs.length}`);
  
  // Check for default-jewel
  const defaultJewel = (html.match(/default-jewel/g) || []).length;
  console.log(`default-jewel references: ${defaultJewel}`);
  
  // Check for /uploads/products/ in actual rendered img tags
  const uploadsImgs = (html.match(/uploads\/products\//g) || []).length;
  console.log(`/uploads/products/ references: ${uploadsImgs}`);

  // 3. Verify a few actual images load
  console.log('\n=== IMAGE AVAILABILITY ===');
  const testImages = [
    'hqxrbjrmvzhvj1iec4qb.jpg',
    'rx0ghynmcj0ojdrxnugi.jpg',
    'z6bcarwguoc7ndwpescr.jpg',
  ];

  for (const img of testImages) {
    try {
      const status = await new Promise((resolve) => {
        https.get(`https://sparkbluediamond.com/uploads/products/${img}`, (r) => {
          resolve(r.statusCode);
        }).on('error', () => resolve('ERROR'));
      });
      console.log(`  ${img}: ${status}`);
    } catch (e) {
      console.log(`  ${img}: FAILED`);
    }
  }
}

main().catch(console.error);
