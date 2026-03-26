const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

async function testWhatsapp(phone) {
    const user = process.env.WHATSAPP_API_USER;
    const pass = process.env.WHATSAPP_API_PASS;
    const sender = process.env.WHATSAPP_API_SENDER;
    const apiUrl = process.env.WHATSAPP_API_URL || 'http://bhashsms.com/api/sendmsg.php';

    console.log(`Testing WhatsApp with User: ${user}, Sender: ${sender}`);

    const params = new URLSearchParams({
        user: user,
        pass: pass,
        sender: sender,
        phone: phone,
        text: 'Hello from Spark Blue Diamond! This is a test message.',
        priority: 'wa',
        stype: 'normal'
    });

    try {
        const url = `${apiUrl}?${params.toString()}`;
        console.log(`Request URL: ${url}`);
        const response = await axios.get(url);
        console.log(`Response: ${response.data}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

const targetPhone = process.argv[2];
if (!targetPhone) {
    console.log('Usage: node test-whatsapp.js [10_digit_phone_number]');
    process.exit(1);
}

testWhatsapp(targetPhone);
