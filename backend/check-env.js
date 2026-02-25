const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function checkEnv() {
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

        const res = await ssh.execCommand('cat /var/www/sbd_backend/.env');
        console.log('Production .env variables:');
        const lines = res.stdout.split('\n');
        for (const line of lines) {
            if (line.trim() && !line.startsWith('#')) {
                const key = line.split('=')[0];
                const value = line.split('=')[1];
                console.log(`${key}=${value ? '***' + value.substring(value.length - 4) : 'EMPTY'}`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Error checking env:', err);
        process.exit(1);
    }
}

checkEnv();
