import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const diagnostics: any = {
        timestamp: new Date().toISOString(),
        env: {
            DATABASE_URL: process.env.DATABASE_URL ? 'SET (Hidden for security)' : 'NOT SET',
            POLYGON_API_KEY: process.env.POLYGON_API_KEY ? 'SET (Hidden for security)' : 'NOT SET',
            NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
            NODE_ENV: process.env.NODE_ENV,
        },
        database: {
            connected: false,
            error: null,
            counts: {
                users: 0,
                watchlist: 0,
                marketMovers: 0,
                portfolioHoldings: 0,
            }
        }
    };

    try {
        // Test connection with a simple query
        await prisma.$queryRaw`SELECT 1`;
        diagnostics.database.connected = true;

        // Get record counts
        const [userCount, watchlistCount, moverCount, portfolioCount] = await Promise.all([
            prisma.user.count(),
            prisma.watchlist.count(),
            prisma.marketMover.count(),
            prisma.portfolioHolding.count(),
        ]);

        diagnostics.database.counts = {
            users: userCount,
            watchlist: watchlistCount,
            marketMovers: moverCount,
            portfolioHoldings: portfolioCount,
        };
    } catch (error: any) {
        diagnostics.database.connected = false;
        diagnostics.database.error = error.message;
    }

    return NextResponse.json(diagnostics);
}
