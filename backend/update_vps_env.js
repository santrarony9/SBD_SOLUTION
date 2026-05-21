const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function updateEnv() {
    try {
        await ssh.connect({
            host: '160.187.68.243',
            username: 'root',
            password: 'Bm0y431YQKrf6iI'
        });
        console.log('Connected!');
        
        const res = await ssh.execCommand('cat /var/www/sbd_backend/.env');
        let content = res.stdout;
        
        // Add vercel domain if not present
        if (!content.includes('sbd-solutionfrontend.vercel.app')) {
            const frontendMatch = content.match(/FRONTEND_URL=(.*)/);
            if (frontendMatch) {
                const oldUrl = frontendMatch[1];
                const newUrl = `https://sbd-solutionfrontend.vercel.app,${oldUrl}`;
                content = content.replace(`FRONTEND_URL=${oldUrl}`, `FRONTEND_URL=${newUrl}`);
                
                // Write back
                const b64 = Buffer.from(content).toString('base64');
                await ssh.execCommand(`echo '${b64}' | base64 -d > /var/www/sbd_backend/.env`);
                console.log('Updated FRONTEND_URL to include Vercel domain');
                
                // Restart PM2
                await ssh.execCommand('export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh" && pm2 restart sbd-backend');
                console.log('Restarted PM2');
            }
        } else {
            console.log('Vercel domain already in FRONTEND_URL');
        }
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

updateEnv();
