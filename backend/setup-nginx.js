const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function setupNginx() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect({
            host: '160.187.68.243',
            username: 'root',
            password: 'Bm0y431YQKrf6iI',
            readyTimeout: 60000,
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

        // Step 1: Generate self-signed SSL cert (Cloudflare Full mode doesn't verify)
        console.log('Generating self-signed SSL certificate...');
        const sslRes = await ssh.execCommand(
            'mkdir -p /etc/nginx/ssl && ' +
            'openssl req -x509 -nodes -days 3650 -newkey rsa:2048 ' +
            '-keyout /etc/nginx/ssl/api.key -out /etc/nginx/ssl/api.crt ' +
            '-subj "/CN=api.sparkbluediamond.com" 2>&1'
        );
        console.log('SSL Cert =>', sslRes.stdout, sslRes.stderr);

        // Step 2: Write Nginx config with both HTTP and HTTPS
        console.log('Writing Cloudflare-ready Nginx configuration with SSL...');
        
        // Write config line by line to avoid escaping issues
        const configLines = [
            'server {',
            '    listen 80;',
            '    listen 443 ssl;',
            '    server_name api.sparkbluediamond.com;',
            '',
            '    ssl_certificate /etc/nginx/ssl/api.crt;',
            '    ssl_certificate_key /etc/nginx/ssl/api.key;',
            '',
            '    # Cloudflare Real IP Configuration',
            '    set_real_ip_from 173.245.48.0/20;',
            '    set_real_ip_from 103.21.244.0/22;',
            '    set_real_ip_from 103.22.200.0/22;',
            '    set_real_ip_from 103.31.4.0/22;',
            '    set_real_ip_from 141.101.64.0/18;',
            '    set_real_ip_from 108.162.192.0/18;',
            '    set_real_ip_from 190.93.240.0/20;',
            '    set_real_ip_from 188.114.96.0/20;',
            '    set_real_ip_from 197.234.240.0/22;',
            '    set_real_ip_from 198.41.128.0/17;',
            '    set_real_ip_from 162.158.0.0/15;',
            '    set_real_ip_from 104.16.0.0/13;',
            '    set_real_ip_from 172.64.0.0/13;',
            '    set_real_ip_from 131.0.72.0/22;',
            '    real_ip_header CF-Connecting-IP;',
            '',
            '    location / {',
            '        proxy_pass http://localhost:3001;',
            '        proxy_set_header Host $host;',
            '        proxy_set_header X-Real-IP $remote_addr;',
            '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;',
            '        proxy_set_header X-Forwarded-Proto $scheme;',
            '',
            '        proxy_read_timeout 300;',
            '        proxy_connect_timeout 300;',
            '        proxy_send_timeout 300;',
            '    }',
            '}',
        ];
        const configContent = configLines.join('\n');

        // Write via base64 to avoid ALL shell escaping issues
        const b64 = Buffer.from(configContent).toString('base64');
        const writeRes = await ssh.execCommand(`echo '${b64}' | base64 -d > /etc/nginx/conf.d/api.sparkbluediamond.com.conf`);
        console.log('Write Config =>', writeRes.stdout, writeRes.stderr);

        console.log('Testing Nginx syntax...');
        const testRes = await ssh.execCommand('nginx -t');
        console.log('Test =>', testRes.stdout, testRes.stderr);

        console.log('Restarting Nginx...');
        await ssh.execCommand('systemctl restart nginx');

        console.log('Setup complete! Nginx now supports HTTPS for Cloudflare Full mode.');
        process.exit(0);

    } catch (err) {
        console.error('Nginx setup failed:', err);
        process.exit(1);
    }
}

setupNginx();
