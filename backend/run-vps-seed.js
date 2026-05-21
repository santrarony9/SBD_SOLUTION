const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function runSeed() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect({
            host: '160.187.68.243',
            username: 'root',
            password: 'Bm0y431YQKrf6iI',
            readyTimeout: 60000,
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

        console.log('Running Aura Seed on VPS...');
        const seedRes = await ssh.execCommand(`${initEnv} && node seed-aura.js`, { cwd: remoteDir });
        console.log('Seed Result =>', seedRes.stdout, seedRes.stderr);

        console.log('Running Simple Seed on VPS...');
        const simpleRes = await ssh.execCommand(`${initEnv} && node seed-simple.js`, { cwd: remoteDir });
        console.log('Simple Seed Result =>', simpleRes.stdout, simpleRes.stderr);

        console.log('Running Master Seed on VPS...');
        const masterRes = await ssh.execCommand(`${initEnv} && npx prisma db seed`, { cwd: remoteDir });
        console.log('Master Seed Result =>', masterRes.stdout, masterRes.stderr);

        process.exit(0);
    } catch (err) {
        console.error('VPS Seed failed:', err);
        process.exit(1);
    }
}

runSeed();
