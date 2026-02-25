const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function setupNginx() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect({
            host: '160.187.68.243',
            username: 'root',
            password: 'Bm0y431YQKrf6iI',
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

        console.log('Writing Nginx configuration for api.sparkbluediamond.com...');
        const nginxConfig = `server {
    listen 80;
    server_name api.sparkbluediamond.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`;

        const writeRes = await ssh.execCommand(`printf '${nginxConfig.replace(/\n/g, '\\n')}' > /etc/nginx/conf.d/api.sparkbluediamond.com.conf`);
        console.log('Write Config =>', writeRes.stdout, writeRes.stderr);

        console.log('Restarting Nginx...');
        const restartRes = await ssh.execCommand('systemctl restart nginx');
        console.log('Restart =>', restartRes.stdout, restartRes.stderr);

        console.log('Running Certbot to issue SSL certificate...');
        const certRes = await ssh.execCommand('certbot --nginx -n -d api.sparkbluediamond.com --agree-tos -m info@newsakhon.com');
        console.log('Certbot =>', certRes.stdout, certRes.stderr);

        console.log('Setup complete!');
        process.exit(0);

    } catch (err) {
        console.error('Nginx setup failed:', err);
        process.exit(1);
    }
}

setupNginx();
