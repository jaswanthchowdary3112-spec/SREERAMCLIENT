const { PrismaClient } = require('@prisma/client');

// Force DATABASE_URL specifically for this test script
process.env.DATABASE_URL = "postgres://63359754b7bd08c8c359ba6a4cd5fb908664fd09c5566eaac5ef98b7335ecfe9:sk_Wl9Tb4vrzWZo7LQuCm8Jh@db.prisma.io:5432/postgres?sslmode=require";

const prisma = new PrismaClient();

async function main() {
    const email = 'flow-test-local@example.com';
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
    });
    if (user) {
        console.log('---TOKEN_START---');
        console.log(user.approvalToken);
        console.log('---TOKEN_END---');
    } else {
        console.log('User not found');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
