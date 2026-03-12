require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function m() {
  try {
    const res = await p.user.updateMany({
        where: { status: 'pending' },
        data: { status: 'approved' }
    });
    console.log(`Approved ${res.count} users.`);
    
    // Also ensure jaswanthvellanki11@gmail.com is an owner if they exist
    const ownerEmail = "jaswanthvellanki11@gmail.com";
    const u = await p.user.findUnique({ where: { email: ownerEmail } });
    if (u) {
        await p.user.update({
            where: { email: ownerEmail },
            data: { role: 'owner', status: 'approved' }
        });
        console.log(`Ensured ${ownerEmail} is approved owner.`);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await p.$disconnect();
  }
}
m();
