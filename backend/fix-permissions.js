const fs = require('fs');
const path = require('path');

console.log('Checking permissions for Prisma binary...');

if (process.platform !== 'win32') {
    try {
        const prismaBin = path.join(__dirname, 'node_modules', '.bin', 'prisma');

        if (fs.existsSync(prismaBin)) {
            console.log(`Found prisma binary at ${prismaBin}`);
            // Add executable permissions (rwx for owner, rx for group/others)
            fs.chmodSync(prismaBin, '755');
            console.log('Successfully set 755 permissions on prisma binary.');
        } else {
            console.warn(`Prisma binary not found at ${prismaBin}. Skipping chmod.`);
        }
    } catch (error) {
        console.error('Error attempting to fix permissions:', error);
        // Don't exit with error, try to proceed anyway
    }
} else {
    console.log('Windows detected. Skipping permission fix.');
}
