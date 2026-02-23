const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedWatchlist() {
    const commonStocks = ["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL", "AMZN", "META", "NFLX"];

    console.log("Seeding Watchlist...");
    for (const ticker of commonStocks) {
        await prisma.watchlist.upsert({
            where: { ticker },
            update: { category: "Common" },
            create: { ticker, category: "Common" }
        });
    }
    console.log("Seeded", commonStocks.length, "common stocks.");
    await prisma.$disconnect();
}

seedWatchlist();
