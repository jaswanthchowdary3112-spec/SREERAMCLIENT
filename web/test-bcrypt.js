const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function runTest() {
    console.log("--- BCRYPT TEST ---");
    const pw = "password123";
    const hash = bcrypt.hashSync(pw, 10);
    console.log("Generated Hash:", hash);
    const match = bcrypt.compareSync(pw, hash);
    console.log("Match Result:", match);

    if (!match) {
        console.error("BCRYPT IS BROKEN ON THIS MACHINE");
    }

    console.log("--- SEEDING SAMPLE DATA ---");
    try {
        await prisma.marketMover.upsert({
            where: { id: 1 },
            update: {},
            create: {
                ticker: "AAPL",
                type: "day_ripper",
                price: 150.25,
                changePercent: 5.5,
                session: "Regular",
                updatedAt: new Date(),
                commonFlag: 1
            }
        });
        await prisma.marketMover.upsert({
            where: { id: 2 },
            update: {},
            create: {
                ticker: "BTC",
                type: "day_dipper",
                price: 45000.00,
                changePercent: -2.3,
                session: "Regular",
                updatedAt: new Date(),
                commonFlag: 1
            }
        });
        console.log("Sample movers seeded.");
    } catch (e) {
        console.error("Seeding failed:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

runTest();
