require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function m() {
  try {
    const holdings = await p.portfolioHolding.findMany();
    console.log("Holdings:", JSON.stringify(holdings, null, 2));
    
    const users = await p.user.findMany({
        where: { role: 'owner' }
    });
    console.log("Owners:", JSON.stringify(users, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await p.$disconnect();
  }
}
m();
