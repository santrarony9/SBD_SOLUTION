
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
    try {
        const users = await prisma.user.findMany({
            where: {
                mobile: '8240054002'
            }
        });
        console.log('USERS_BY_MOBILE_RESULT:' + JSON.stringify(users));
    } catch (err) {
        console.error('Error checking user:', err);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
