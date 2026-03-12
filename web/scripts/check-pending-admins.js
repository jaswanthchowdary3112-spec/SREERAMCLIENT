require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function m() {
  try {
    const users = await p.user.findMany({
        where: { role: 'admin', status: 'pending' },
        select: { email: true, createdAt: true }
    });
    console.log("Pending Admins:", JSON.stringify(users, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await p.$disconnect();
  }
}
m();
