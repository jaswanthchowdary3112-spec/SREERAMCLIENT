require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function m() {
  try {
    const users = await p.user.findMany({
      select: { email: true, role: true, status: true }
    });
    console.log(JSON.stringify(users, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await p.$disconnect();
  }
}
m();
