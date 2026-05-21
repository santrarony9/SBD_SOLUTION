const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function fixNginx() {
    try {
        await ssh.connect({
            host: '160.187.68.243',
            username: 'root',
            password: 'Bm0y431YQKrf6iI'
        });
        
        console.log('Connected!');

        const config = `server {
    listen 80;
    listen 443 ssl;
    server_name api.sparkbluediamond.com;

    ssl_certificate /etc/nginx/ssl/api.crt;
    ssl_certificate_key /etc/nginx/ssl/api.key;

    client_max_body_size 100M;

    # Cloudflare Real IP Configuration
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 131.0.72.0/22;
    real_ip_header CF-Connecting-IP;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}`;

        console.log('Writing new Nginx config...');
        // Use a temporary file and then move it to avoid permission issues with echo if needed, 
        // but since we are root we can just write directly.
        await ssh.execCommand(`echo '${config}' > /etc/nginx/conf.d/api.sparkbluediamond.com.conf`);
        
        console.log('Testing Nginx config...');
        const test = await ssh.execCommand('nginx -t');
        console.log(test.stdout);
        console.log(test.stderr);

        if (test.stderr.includes('test is successful')) {
            console.log('Restarting Nginx...');
            await ssh.execCommand('systemctl restart nginx');
            console.log('Nginx restarted successfully!');
        } else {
            console.error('Nginx config test failed!');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

fixNginx();
