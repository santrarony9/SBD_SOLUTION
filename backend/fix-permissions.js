const fs = require('fs');
const path = require('path');

console.log('Checking permissions for binaries...');

if (process.platform !== 'win32') {
    try {
        const binaries = ['prisma', 'nest'];

        binaries.forEach(binName => {
            const binPath = path.join(__dirname, 'node_modules', '.bin', binName);
            if (fs.existsSync(binPath)) {
                console.log(`Found ${binName} binary at ${binPath}`);
                // Add executable permissions (rwx for owner, rx for group/others)
                fs.chmodSync(binPath, '755');
                console.log(`Successfully set 755 permissions on ${binName} binary.`);
            } else {
                console.warn(`${binName} binary not found at ${binPath}. Skipping chmod.`);
            }
        });
    } catch (error) {
        console.error('Error attempting to fix permissions:', error);
        // Don't exit with error, try to proceed anyway
    }
} else {
    console.log('Windows detected. Skipping permission fix.');
}
