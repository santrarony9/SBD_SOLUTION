const { NodeSSH } = require('node-ssh');
const path = require('path');

const ssh = new NodeSSH();

async function deploy() {
    try {
        console.log('Connecting to VPS...');
        // Connect to VPS
        await ssh.connect({
            host: '160.187.68.243',
            username: 'root',
            password: 'Bm0y431YQKrf6iI',
            debug: (msg) => console.log('DEBUG:', msg),
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

        // Prepare VPS environment
        console.log('Preparing remote directory /var/www/sbd_backend...');
        await ssh.execCommand('mkdir -p /var/www/sbd_backend');

        // Filter function for uploading
        const excludeList = ['node_modules', 'dist', '.git', 'deploy.js', '.env.example'];
        const validate = (localPath) => {
            const p = localPath.replace(/\\/g, '/');
            const shouldExclude = excludeList.some(excluded => p.includes(`/${excluded}`) || p.endsWith(excluded));
            return !shouldExclude;
        };

        console.log('Uploading backend source files... (this may take a minute)');
        const localDir = __dirname;
        const remoteDir = '/var/www/sbd_backend';

        await ssh.putDirectory(localDir, remoteDir, {
            recursive: true,
            concurrency: 10,
            validate
        });
        console.log('Upload complete!');

        console.log('Installing Node.js via NVM...');
        const initEnv = 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"';

        await ssh.execCommand('curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash');
        await ssh.execCommand(`${initEnv} && nvm install 20 && nvm alias default 20`);

        console.log('Running npm install on VPS...');
        const npmRes = await ssh.execCommand(`${initEnv} && npm install --legacy-peer-deps`, { cwd: remoteDir });
        console.log('npm install => ', npmRes.stdout, npmRes.stderr);

        console.log('Running prisma generate...');
        const prismaRes = await ssh.execCommand(`${initEnv} && npx prisma generate`, { cwd: remoteDir });
        console.log('prisma generate => ', prismaRes.stdout, prismaRes.stderr);

        console.log('Running npm run build...');
        const buildRes = await ssh.execCommand(`${initEnv} && npm run build`, { cwd: remoteDir });
        console.log('build => ', buildRes.stdout, buildRes.stderr);

        console.log('Ensuring PM2 is installed...');
        await ssh.execCommand(`${initEnv} && npm install -g pm2`);

        console.log('Restarting PM2 process...');
        const pm2Res = await ssh.execCommand(`${initEnv} && (pm2 restart sbd-backend || pm2 start dist/main.js --name sbd-backend)`, { cwd: remoteDir });
        console.log('PM2 => ', pm2Res.stdout, pm2Res.stderr);

        console.log('Saving PM2 state...');
        await ssh.execCommand(`${initEnv} && pm2 save`);

        console.log('Deployment complete! The NestJS backend is running.');
        process.exit(0);

    } catch (err) {
        console.error('Deployment failed:', err);
        process.exit(1);
    }
}

deploy();
