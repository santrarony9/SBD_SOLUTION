const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function checkNginx() {
    try {
        await ssh.connect({
            host: '160.187.68.243',
            username: 'root',
            password: 'Bm0y431YQKrf6iI'
        });
        
        console.log('\n=== NGINX CONFIG ===');
        const nginx = await ssh.execCommand('cat /etc/nginx/nginx.conf | grep client_max_body_size');
        console.log('Global Nginx client_max_body_size:', nginx.stdout || 'Not found (default 1MB)');

        const sbdConfig = await ssh.execCommand('ls /etc/nginx/sites-enabled/');
        console.log('\nEnabled sites:', sbdConfig.stdout);

        const sbdSite = await ssh.execCommand('cat /etc/nginx/sites-enabled/default | grep client_max_body_size');
        console.log('Site-specific client_max_body_size:', sbdSite.stdout || 'Not found');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

checkNginx();
