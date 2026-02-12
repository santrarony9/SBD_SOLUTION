
async function testApi() {
    const url = 'https://api.sparkbluediamond.com/api/chat';

    console.log('--- Testing OPTIONS (Preflight) ---');
    try {
        const optionsRes = await fetch(url, {
            method: 'OPTIONS',
            headers: {
                'Access-Control-Request-Method': 'POST',
                'Origin': 'https://sparkbluediamond.com'
            }
        });
        console.log('OPTIONS Status:', optionsRes.status);
        console.log('OPTIONS Headers:', [...optionsRes.headers.entries()]);
    } catch (error) {
        console.error('OPTIONS Error:', error.message);
    }

    console.log('\n--- Testing POST ---');
    try {
        const start = Date.now();
        const postRes = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://sparkbluediamond.com'
            },
            body: JSON.stringify({
                message: 'Hello, testing connection',
                history: []
            })
        });
        const duration = Date.now() - start;
        console.log('POST Status:', postRes.status);
        console.log('POST Duration:', duration, 'ms');

        const text = await postRes.text();
        console.log('POST Body:', text);
        console.log('POST Headers:', [...postRes.headers.entries()]);
    } catch (error) {
        console.error('POST Error:', error.message);
    }
}

testApi();
