import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Resetting Admin credentials...');

    const email = 'admin@sparkblue.com';
    const password = 'Admin@123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: Role.ADMIN,
            name: 'Super Admin',
        },
        create: {
            email,
            password: hashedPassword,
            name: 'Super Admin',
            role: Role.ADMIN,
        },
    });

    console.log('Admin user updated/created:', admin);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
