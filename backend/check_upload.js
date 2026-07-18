const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
async function run() {
    try {
        await ssh.connect({ 
            host: '160.187.68.243', 
            username: 'root', 
            password: '&hT0C10k!9tp', 
            tryKeyboard: true 
        });
        // Create a dummy 1MB file
        await ssh.execCommand('dd if=/dev/zero of=/tmp/dummy.jpg bs=1M count=1');
        const res = await ssh.execCommand('curl -X POST -F "file=@/tmp/dummy.jpg" http://localhost:3001/api/media/upload');
        console.log("STDOUT:", res.stdout);
        console.log("STDERR:", res.stderr);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
