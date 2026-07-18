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
        const res = await ssh.execCommand('curl -I http://localhost:3001/uploads/products/qtmehbtsxkb8exbspxt4.jpg');
        console.log("STDOUT:", res.stdout);
        console.log("STDERR:", res.stderr);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
