const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function findNginxConfig() {
    try {
        await ssh.connect({
            host: '160.187.68.243',
            username: 'root',
            password: 'Bm0y431YQKrf6iI'
        });
        
        console.log('\n=== CHECKING CONF.D ===');
        const confd = await ssh.execCommand('ls /etc/nginx/conf.d/');
        console.log('Files in /etc/nginx/conf.d/:', confd.stdout);

        console.log('\n=== CHECKING NGINX.CONF CONTENT ===');
        const nginxConf = await ssh.execCommand('cat /etc/nginx/nginx.conf');
        console.log(nginxConf.stdout);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

findNginxConfig();
