const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function checkLogs() {
    try {
        await ssh.connect({
            host: '160.187.68.243',
            username: 'root',
            password: 'Bm0y431YQKrf6iI'
        });
        
        const initEnv = 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"';
        
        console.log('\n=== RECENT UPLOAD LOGS ===');
        const logs = await ssh.execCommand(`${initEnv} && pm2 logs sbd-backend --lines 200 --nostream | grep -iE "upload|error|400|500"`);
        console.log(logs.stdout);
        console.log(logs.stderr);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

checkLogs();
