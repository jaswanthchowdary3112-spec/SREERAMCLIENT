const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkDb() {
    try {
        const users = await prisma.user.count();
        const movers = await prisma.marketMover.count();
        const holdings = await prisma.portfolioHolding.count();
        const watchlist = await prisma.watchlist.count();

        console.log("--- DB STATUS ---");
        console.log("Users:", users);
        console.log("Movers:", movers);
        console.log("Portfolio Holdings:", holdings);
        console.log("Watchlist Stocks:", watchlist);
        console.log("------------------");
    } catch (e) {
        console.error("DB check failed:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkDb();
