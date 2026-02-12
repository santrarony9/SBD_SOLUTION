
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/products',
    method: 'GET',
    timeout: 2000
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk.toString().substring(0, 100)}...`);
    });
});

req.on('error', (e) => {
    console.error(`PROBLEM: ${e.message}`);
});

req.on('timeout', () => {
    req.destroy();
    console.log('TIMEOUT');
});

req.end();
