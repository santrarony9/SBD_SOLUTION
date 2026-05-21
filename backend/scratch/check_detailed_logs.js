const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function checkDetailedLogs() {
    try {
        await ssh.connect({
            host: '160.187.68.243',
            username: 'root',
            password: 'Bm0y431YQKrf6iI'
        });
        
        const initEnv = 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"';
        
        console.log('\n=== RECENT 500 LOGS ===');
        const logs = await ssh.execCommand(`${initEnv} && pm2 logs sbd-backend --lines 500 --nostream | grep -C 5 "Error"`);
        console.log(logs.stdout);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

checkDetailedLogs();
