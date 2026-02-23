
async function testRender() {
    const url = 'https://spark-blue-backend.onrender.com/api/products';
    console.log(`Testing direct Render URL: ${url}`);

    try {
        const start = Date.now();
        const res = await fetch(url);
        const duration = Date.now() - start;
        console.log('Status:', res.status);
        console.log('Duration:', duration, 'ms');

        const data = await res.json();
        console.log('Product Count:', Array.isArray(data) ? data.length : 'Not an array');
        if (data && data.length > 0) {
            console.log('First Product Slug:', data[0].slug);
        }
    } catch (error) {
        console.error('Fetch Error:', error.message);
    }
}

testRender();
