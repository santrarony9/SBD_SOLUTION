const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function check() {
    try {
        await ssh.connect({
            host: '160.187.68.243',
            username: 'root',
            password: 'Bm0y431YQKrf6iI',
            tryKeyboard: true,
            onKeyboardInteractive: (name, instructions, instructionsLang, prompts, finish) => {
                if (prompts.length > 0 && prompts[0].prompt.toLowerCase().includes('password')) {
                    finish(['Bm0y431YQKrf6iI']);
                } else {
                    finish([]);
                }
            }
        });

        console.log('--- Checking .env tail end ---');
        const envRes = await ssh.execCommand('tail -n 3 /var/www/sbd_backend/.env');
        console.log(envRes.stdout);

        console.log('--- Calling API directly ---');
        const fetch = (await import('node-fetch')).default;
        const apiRes = await fetch('http://160.187.68.243:3001/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Hello', history: [] })
        });
        const text = await apiRes.text();
        console.log('API RESPONSE:', text);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
