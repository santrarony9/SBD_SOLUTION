const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function fixEnv() {
    try {
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

        console.log('Fetching raw .env content...');
        const res = await ssh.execCommand('cat /var/www/sbd_backend/.env');
        let content = res.stdout;

        // Clean up any malformed \n string injections
        content = content.replace(/\\nGEMINI_API_KEY=AIzaSyD8OhxppMX3Co3RvYyRpGJ8ppN07HhH1HU/g, '');

        // Ensure standard newline and add the proper key at the bottom
        if (!content.endsWith('\n')) content += '\n';
        content += 'GEMINI_API_KEY=AIzaSyD8OhxppMX3Co3RvYyRpGJ8ppN07HhH1HU\n';

        console.log('Writing corrected .env back to server...');
        const escapedContent = content.replace(/'/g, "'\\''");
        await ssh.execCommand(`printf '${escapedContent}' > /var/www/sbd_backend/.env`);

        console.log('Restarting PM2 backend...');
        const pm2Res = await ssh.execCommand('export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh" && pm2 restart sbd-backend --update-env', { cwd: '/var/www/sbd_backend' });

        console.log('Testing the API Endpoint directly again...');
        const fetch = (await import('node-fetch')).default;
        const apiRes = await fetch('http://160.187.68.243:3001/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Hello', history: [] })
        });
        const text = await apiRes.text();
        console.log('API RESPONSE:', text);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
fixEnv();
