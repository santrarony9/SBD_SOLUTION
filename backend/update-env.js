const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function updateEnv() {
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

        console.log('Appending GEMINI_API_KEY to .env...');
        const appendRes = await ssh.execCommand('echo "\\nGEMINI_API_KEY=AIzaSyD8OhxppMX3Co3RvYyRpGJ8ppN07HhH1HU" >> /var/www/sbd_backend/.env');
        console.log('Append Action =>', appendRes.stdout, appendRes.stderr);

        console.log('Restarting PM2 backend with env updates...');
        const pm2Res = await ssh.execCommand('export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh" && pm2 restart sbd-backend --update-env', { cwd: '/var/www/sbd_backend' });
        console.log('PM2 Restart =>', pm2Res.stdout, pm2Res.stderr);

        console.log('Update Complete!');
        process.exit(0);

    } catch (err) {
        console.error('Update failed:', err);
        process.exit(1);
    }
}

updateEnv();
