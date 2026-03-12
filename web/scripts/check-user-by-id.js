require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function m() {
  try {
    const u = await p.user.findUnique({
      where: { id: 'cmmmacuf30000la0ak3padfxp' }
    });
    console.log(JSON.stringify(u, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await p.$disconnect();
  }
}
m();
