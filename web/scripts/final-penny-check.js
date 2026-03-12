require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function m() {
    const t = ['SENS', 'MARA', 'RIOT', 'HUT', 'CIFR', 'SOS', 'QBTS'];
    const movers = await p.marketMover.findMany({
        where: { ticker: { in: t } }
    });
    console.log(movers.map(x => ({ 
        ticker: x.ticker, 
        price: x.price, 
        updated: x.updatedAt 
    })));
    await p.$disconnect();
}
m();
