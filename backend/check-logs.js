const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function checkLogs() {
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

        console.log('Fetching last 100 lines of PM2 logs...');
        const logRes = await ssh.execCommand('export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh" && pm2 logs sbd-backend --lines 100 --nostream', { cwd: '/var/www/sbd_backend' });

        console.log(logRes.stdout);
        if (logRes.stderr) console.error('STDERR:', logRes.stderr);

        process.exit(0);
    } catch (err) {
        console.error('Failed:', err);
        process.exit(1);
    }
}

checkLogs();
