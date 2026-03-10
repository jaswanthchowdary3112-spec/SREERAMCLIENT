import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const movers = await prisma.marketMover.count();
    const watchlist = await prisma.watchlist.count();
    const types = await prisma.marketMover.groupBy({
        by: ['type'],
        _count: true
    });
    const samples = await prisma.marketMover.findMany({ take: 5 });

    console.log('--- DATABASE STATUS ---');
    console.log('MarketMover Count:', movers);
    console.log('Watchlist Count:', watchlist);
    console.log('Types:', JSON.stringify(types, null, 2));
    console.log('Samples:', JSON.stringify(samples, null, 2));

    await prisma.$disconnect();
}

check();
