
async function testSlug() {
    const slug = 'sunp9(r)-1771585962709';
    const url = `https://spark-blue-backend.onrender.com/api/products/${slug}`;
    console.log(`Testing direct Slug URL: ${url}`);

    try {
        const start = Date.now();
        const res = await fetch(url);
        const duration = Date.now() - start;
        console.log('Status:', res.status);
        console.log('Duration:', duration, 'ms');

        const data = await res.json();
        if (res.ok) {
            console.log('Product Name:', data.name);
            console.log('Slug in response:', data.slug);
        } else {
            console.log('Error Response:', data);
        }
    } catch (error) {
        console.error('Fetch Error:', error.message);
    }
}

testSlug();
