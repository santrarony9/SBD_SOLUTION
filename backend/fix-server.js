const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function fix() {
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

        const initEnv = 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"';

        // Step 1: Stop ALL facescan apps (they are eating 100% CPU)
        console.log('\n=== STEP 1: Stopping facescan apps ===');
        const stop1 = await ssh.execCommand(`${initEnv} && pm2 stop facescan-backend facescan-api dp-facescan-backend 2>/dev/null; echo DONE`);
        console.log('Stop facescan =>', stop1.stdout, stop1.stderr);

        // Step 2: Kill anything on port 3001
        console.log('\n=== STEP 2: Clearing port 3001 ===');
        const kill = await ssh.execCommand('fuser -k 3001/tcp 2>/dev/null; echo PORT_CLEARED');
        console.log('Port clear =>', kill.stdout);

        // Step 3: Check memory
        console.log('\n=== STEP 3: Memory check ===');
        const mem = await ssh.execCommand('free -m');
        console.log(mem.stdout);

        // Step 4: Stop sbd-backend, delete it, and start fresh
        console.log('\n=== STEP 4: Fresh start sbd-backend ===');
        const freshStart = await ssh.execCommand(`${initEnv} && pm2 stop sbd-backend 2>/dev/null; pm2 delete sbd-backend 2>/dev/null; cd /var/www/sbd_backend && pm2 start dist/main.js --name sbd-backend --max-memory-restart 300M`);
        console.log('Fresh start =>', freshStart.stdout, freshStart.stderr);

        // Step 5: Wait 5 seconds and check if it's actually running
        console.log('\n=== STEP 5: Waiting 5 seconds for app to boot... ===');
        await new Promise(r => setTimeout(r, 5000));

        const status = await ssh.execCommand(`${initEnv} && pm2 list`);
        console.log(status.stdout);

        // Step 6: Check the error logs
        console.log('\n=== STEP 6: Recent error logs ===');
        const logs = await ssh.execCommand(`${initEnv} && pm2 logs sbd-backend --lines 30 --nostream`);
        console.log(logs.stdout);
        if (logs.stderr) console.log('STDERR:', logs.stderr);

        // Step 7: Test if the app actually responds
        console.log('\n=== STEP 7: Testing endpoint ===');
        const test = await ssh.execCommand('curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/products');
        console.log('HTTP Status for /api/products:', test.stdout);

        // Step 8: Save PM2 state
        console.log('\n=== STEP 8: Saving state ===');
        await ssh.execCommand(`${initEnv} && pm2 save`);
        console.log('State saved!');

        console.log('\n✅ Fix complete!');
        process.exit(0);
    } catch (err) {
        console.error('Fix failed:', err.message);
        process.exit(1);
    }
}

fix();
