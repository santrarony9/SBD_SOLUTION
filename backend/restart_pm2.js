
const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function restart() {
    try {
        console.log('Connecting to VPS...');
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
        console.log('Connected!');

        const initEnv = 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"';
        const remoteDir = '/var/www/sbd_backend';

        console.log('Restarting PM2 process...');
        const pm2Res = await ssh.execCommand(`${initEnv} && (pm2 restart sbd-backend || pm2 start dist/main.js --name sbd-backend)`, { cwd: remoteDir });
        console.log('PM2 STDOUT => ', pm2Res.stdout);
        console.log('PM2 STDERR => ', pm2Res.stderr);

        console.log('Saving PM2 state...');
        await ssh.execCommand(`${initEnv} && pm2 save`);

        console.log('Restart complete!');
        process.exit(0);
    } catch (err) {
        console.error('Restart failed:', err);
        process.exit(1);
    }
}

restart();
