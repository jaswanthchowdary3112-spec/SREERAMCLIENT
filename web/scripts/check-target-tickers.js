require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const target = ['NVTA','AYX','CLVR','SPLK','INFI','FSR','ABML','IDEX','GOEV','FUV','LTHM','AFTY','DM','ASHX','CHIE','CHII','CHIM','CHIX','CNHX','CSEX','FNI','HAHA','PEK','XINA','YAO','CHAD'];
  
  console.log('--- MarketMover Status ---');
  const movers = await prisma.marketMover.findMany({
    where: { ticker: { in: target } }
  });
  
  movers.forEach(m => {
    console.log(`${m.ticker}: price=${m.price}, type=${m.type}, updated=${m.updatedAt.toISOString()}`);
  });

  console.log('\n--- Watchlist Membership ---');
  const watchlist = await prisma.watchlist.findMany({
    where: { ticker: { in: target } }
  });
  
  const inWatchlist = new Set(watchlist.map(w => w.ticker));
  target.forEach(t => {
    if (inWatchlist.has(t)) {
      console.log(`${t}: YES`);
    } else {
      console.log(`${t}: NO`);
    }
  });

  await prisma.$disconnect();
}

main();
