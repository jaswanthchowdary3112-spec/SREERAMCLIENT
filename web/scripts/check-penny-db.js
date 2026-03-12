require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function main() {
    const csvPath = 'd:/vercel/Watchlist_Penny.csv';
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim().length > 0).slice(1);
    const tickers = lines.map(line => line.split(',')[1]?.trim().toUpperCase()).filter(t => t);

    console.log(`Checking ${tickers.length} penny tickers...`);

    const movers = await prisma.marketMover.findMany({
        where: { ticker: { in: tickers } }
    });

    console.log(`Found ${movers.length} records in DB.`);
    
    const zeros = movers.filter(m => m.price <= 0.001);
    console.log(`${zeros.length} tickers have zero/placeholder prices.`);
    
    if (zeros.length > 0) {
        console.log('Sample zeros:', zeros.slice(0, 5).map(z => z.ticker));
    }

    await prisma.$disconnect();
}

main();
