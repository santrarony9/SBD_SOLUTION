const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function readApiConfig() {
    try {
        await ssh.connect({
            host: '160.187.68.243',
            username: 'root',
            password: 'Bm0y431YQKrf6iI'
        });
        
        console.log('\n=== api.sparkbluediamond.com.conf ===');
        const config = await ssh.execCommand('cat /etc/nginx/conf.d/api.sparkbluediamond.com.conf');
        console.log(config.stdout);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

readApiConfig();
