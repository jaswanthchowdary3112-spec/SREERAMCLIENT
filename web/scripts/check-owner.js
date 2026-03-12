require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function m() {
  try {
    const email = 'jaswanthvellanki11@gmail.com';
    const u = await p.user.findUnique({
      where: { email }
    });
    console.log("Owner Record:", JSON.stringify(u, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await p.$disconnect();
  }
}
m();
