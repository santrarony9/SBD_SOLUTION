const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function check() {
    try {
        await ssh.connect({
            host: '160.187.68.243',
            username: 'root',
            password: 'Bm0y431YQKrf6iI'
        });
        console.log('Connected!');
        
        const res = await ssh.execCommand('ls -la /var/www/sbd_backend/uploads');
        console.log('Uploads Content:');
        console.log(res.stdout);
        
        const resProducts = await ssh.execCommand('ls -la /var/www/sbd_backend/uploads/products');
        console.log('\nProducts Content:');
        console.log(resProducts.stdout);
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

check();
