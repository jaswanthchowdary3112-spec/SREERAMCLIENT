require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const overrides = {
    'AYX': 48.25,
    'SPLK': 156.90,
    'LTHM': 16.51,
    'ALTM': 5.84,
    'ABML': 3.57,
    'ABAT': 3.57,
    'DM': 4.96,
    'IDEX': 0.27,
    'INFI': 0.008,
    'FSR': 0.0007,
    'FSRNQ': 0.0007,
    'GOEV': 0.37, // Sticking to Yahoo V8 result for consistency
    'FUV': 0.17,
    'CLVR': 0.0001,
    'NVTA': 0.01,
    'SQ': 82.50 // Block Inc current price roughly
  };

  const now = new Date();
  
  for (const [ticker, price] of Object.entries(overrides)) {
    console.log(`Pushing ${ticker}: $${price}...`);
    
    // Update all occurrences of this ticker
    const updated = await prisma.marketMover.updateMany({
      where: { ticker },
      data: {
        price: price,
        dayOpen: price,
        prevClose: price,
        changePercent: 0,
        updatedAt: now
      }
    });
    
    if (updated.count === 0) {
      // If not in DB at all, create as neutral
      await prisma.marketMover.create({
        data: {
          ticker,
          price,
          dayOpen: price,
          prevClose: price,
          changePercent: 0,
          type: 'neutral',
          updatedAt: now
        }
      });
      console.log(` Created new record for ${ticker}.`);
    } else {
      console.log(` Updated ${updated.count} record(s) for ${ticker}.`);
    }
  }

  console.log('Push complete.');
  await prisma.$disconnect();
}

main();
