const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function checkVPS() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect({
            host: '160.187.68.243',
            username: 'root',
            password: 'Bm0y431YQKrf6iI'
        });
        console.log('Connected!');

        console.log('\n=== DISK SPACE ===');
        const df = await ssh.execCommand('df -h');
        console.log(df.stdout);

        console.log('\n=== CPU USAGE (TOP 5) ===');
        const top = await ssh.execCommand('ps -eo pcpu,pid,user,args | sort -k 1 -r | head -6');
        console.log(top.stdout);

        console.log('\n=== PM2 STATUS ===');
        const initEnv = 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"';
        const pm2List = await ssh.execCommand(`${initEnv} && pm2 list`);
        console.log(pm2List.stdout);

        console.log('\n=== RECENT LOGS (ERROR) ===');
        const pm2Logs = await ssh.execCommand(`${initEnv} && pm2 logs sbd-backend --lines 50 --nostream`);
        console.log(pm2Logs.stdout);

        console.log('\n=== CHECKING ENV FILE ===');
        const envCheck = await ssh.execCommand('cat /var/www/sbd_backend/.env | grep CLOUDINARY');
        console.log(envCheck.stdout ? 'Cloudinary keys found in .env' : 'Cloudinary keys MISSING in .env');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

checkVPS();
