
const isServer = true; // Simulating server side
const INTERNAL_API_URL = undefined;
const API_URL = isServer
    ? (INTERNAL_API_URL || 'https://spark-blue-backend.onrender.com/api')
    : '/external-api';

function getFullUrl(endpoint) {
    return `${API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}

console.log('Server-side URL for /products/my-slug:');
console.log(getFullUrl('/products/my-slug'));

const isServerClient = false; // Simulating client side
const API_URL_CLIENT = '/external-api';

function getFullUrlClient(endpoint) {
    let fullUrl = `${API_URL_CLIENT.endsWith('/') ? API_URL_CLIENT.slice(0, -1) : API_URL_CLIENT}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const separator = fullUrl.includes('?') ? '&' : '?';
    fullUrl = `${fullUrl}${separator}_t=${Date.now()}`;
    return fullUrl;
}

console.log('\nClient-side URL for /products/my-slug:');
console.log(getFullUrlClient('/products/my-slug'));
