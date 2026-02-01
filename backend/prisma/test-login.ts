import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testLogin() {
    const email = 'admin@sparkblue.com';
    const password = 'Admin@123';

    console.log(`Testing login for: ${email}`);

    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
        console.error('User NOT FOUND in database!');
        return;
    }

    console.log('User found:', { id: user.id, email: user.email, role: user.role, passwordHash: user.password });

    const isMatch = await bcrypt.compare(password, user.password || '');
    console.log('Password Match Result:', isMatch);
}

testLogin()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
