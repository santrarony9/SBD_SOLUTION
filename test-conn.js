const http = require('http');

function check(path) {
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: path,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    console.log(`Testing GET http://localhost:3001${path} ...`);

    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log(`BODY RAW START>${data}<BODY RAW END`);
            console.log('---');
        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    req.end();
}

check('/api/store/settings/exit_intent');
check('/api/diagnostics/ping');
