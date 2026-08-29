const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
require('dotenv').config();

async function check() {
    try {
        await ssh.connect({
            host: '160.187.68.243',
            username: 'root',
            password: process.env.VPS_PASSWORD,
            readyTimeout: 60000
        });
        console.log('Connected to VPS!');
        const initEnv = 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"';
        
        console.log('\n--- PM2 Status ---');
        const status = await ssh.execCommand(`${initEnv} && pm2 status`);
        console.log(status.stdout);
        console.log(status.stderr);

        console.log('\n--- PM2 Logs ---');
        const logs = await ssh.execCommand(`${initEnv} && pm2 logs sbd-backend --lines 50 --nostream`);
        console.log(logs.stdout);
        console.log(logs.stderr);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
