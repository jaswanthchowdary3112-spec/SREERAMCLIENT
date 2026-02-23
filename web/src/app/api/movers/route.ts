import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const portfolioTickers = searchParams.get('portfolio')?.split(',') || []
    const portfolioSet = new Set(portfolioTickers.map(t => t.toUpperCase()))

    try {

        // -----------------------
        // WATCHLIST CACHE (UNCHANGED)
        // -----------------------

        // Try multiple possible paths for the CSV file on Vercel
        const csvPaths = [
            path.join(process.cwd(), '../Watchlist_New.csv'),
            path.join(process.cwd(), 'public/Watchlist_New.csv'),
            path.join(process.cwd(), 'Watchlist_New.csv'),
            path.join(process.cwd(), '.next/server/public/Watchlist_New.csv')
        ];

        let csvPath = csvPaths[0];
        for (const p of csvPaths) {
            if (fs.existsSync(p)) {
                csvPath = p;
                break;
            }
        }

        const CACHE_TTL = 60000
        const getGlobalCache = () => (global as any).watchlistCache
        const setGlobalCache = (val: any) => { (global as any).watchlistCache = val }

        if (!getGlobalCache() || (Date.now() - getGlobalCache().timestamp > CACHE_TTL)) {
            try {
                if (fs.existsSync(csvPath)) {
                    const stats = fs.statSync(csvPath)

                    if (!getGlobalCache() || stats.mtimeMs !== getGlobalCache().fileMtime) {
                        const content = fs.readFileSync(csvPath, 'utf-8')
                        const lines = content.split('\n')
                        const newSet = new Set<string>()

                        for (let i = 1; i < lines.length; i++) {
                            const parts = lines[i].split(',')
                            if (parts.length > 1) {
                                const t = parts[1]?.trim().toUpperCase()
                                if (t) newSet.add(t)
                            }
                        }

                        setGlobalCache({
                            set: newSet,
                            timestamp: Date.now(),
                            fileMtime: stats.mtimeMs
                        })
                    }
                }
            } catch (e) {
                console.error("[API Movers] Error reading Watchlist_New.csv:", e)
            }
        }

        const allowedTickersSet = getGlobalCache()?.set || new Set<string>()

        // -----------------------
        // MOMENTUM FROM POSTGRES (FIXED)
        // -----------------------

        let m1 = { rippers: [] as any[], dippers: [] as any[] }
        let m5 = { rippers: [] as any[], dippers: [] as any[] }
        let m30 = { rippers: [] as any[], dippers: [] as any[] }
        let day = { rippers: [] as any[], dippers: [] as any[] }
        let common: any[] = []

        try {
            const movers = await prisma.marketMover.findMany({
                select: {
                    type: true,
                    ticker: true,
                    price: true,
                    changePercent: true,
                    session: true,
                    commonFlag: true
                }
            })

            movers.forEach((m: any) => {
                const entry = {
                    ticker: m.ticker,
                    price: m.price || 0,
                    change: m.changePercent || 0,
                    session: m.session || "Closed",
                    commonFlag: m.commonFlag || 0
                }

                if (m.type === "1m_ripper") m1.rippers.push(entry)
                if (m.type === "1m_dipper") m1.dippers.push(entry)

                if (m.type === "5m_ripper") m5.rippers.push(entry)
                if (m.type === "5m_dipper") m5.dippers.push(entry)

                if (m.type === "30m_ripper") m30.rippers.push(entry)
                if (m.type === "30m_dipper") m30.dippers.push(entry)

                if (m.type === "day_ripper") day.rippers.push(entry)
                if (m.type === "day_dipper") day.dippers.push(entry)

                if (m.commonFlag === 1) common.push(entry)
            })

        } catch (e: any) {
            console.error("[API Movers] Failed to fetch marketMover:", e.message)
        }

        // -----------------------
        // FETCH USER PORTFOLIO FROM DB
        // -----------------------
        let dbPortfolio: any[] = [];
        try {
            const session = await getServerSession(authOptions);
            if (session?.user?.email) {
                const user = await prisma.user.findUnique({
                    where: { email: session.user.email },
                    include: { portfolio: true }
                });
                if (user?.portfolio) {
                    dbPortfolio = user.portfolio.map(p => ({
                        ticker: p.ticker,
                        avgCost: p.avgCost,
                        shares: p.shares
                    }));
                }
            }
        } catch (e) {
            console.error("[API Movers] Portfolio fetch failed:", e);
        }

        // -----------------------
        // FETCH LIVE QUOTES FOR ALL TICKERS
        // -----------------------
        const allTickers = Array.from(new Set([
            ...m1.rippers, ...m1.dippers,
            ...m5.rippers, ...m5.dippers,
            ...m30.rippers, ...m30.dippers,
            ...day.rippers, ...day.dippers,
            ...common
        ].map(e => e.ticker)));

        let quotes: Record<string, any> = {};
        if (allTickers.length > 0) {
            try {
                const { getLiveQuotes } = await import('@/lib/stock-api');
                quotes = await getLiveQuotes(allTickers);
            } catch (e) {
                console.error("[API Movers] Failed to fetch live quotes:", e);
            }
        }

        // -----------------------
        // FETCH WATCHLIST FROM PRISMA
        // -----------------------
        let watchlist: any[] = []
        try {
            watchlist = await prisma.watchlist.findMany({
                select: { ticker: true, category: true }
            });
            // Enrich with quotes
            const watchlistTickers = watchlist.map(w => w.ticker);
            const watchlistQuotes = await (await import('@/lib/stock-api')).getLiveQuotes(watchlistTickers);

            watchlist = watchlist.map(w => ({
                ...w,
                ...(watchlistQuotes[w.ticker] || {})
            }));
        } catch (e) {
            console.error("[API Movers] Failed to fetch watchlist:", e);
        }

        return NextResponse.json({
            m1,
            m5,
            m30,
            day,
            common,
            watchlist,
            quotes: quotes,
            news: [],
            portfolio: dbPortfolio,
            movers: common, // Populate movers with common stocks for the CommonListsPage
            sessions: { preMarket: [], regular: [], postMarket: [] },
            engineStatus: {
                lastUpdate: new Date().toISOString(),
                isLive: true,
                statusText: 'Engine Live',
                statusColor: 'green',
                latencyMs: 0,
                session: 'Active'
            },
            botStats: {
                tweetCount: 0,
                lastTweet: null,
                status: 'Online',
                lastLog: '',
                isActive: true
            },
            institutionalStats: {},
            debug: {
                allowedTickersCount: allowedTickersSet.size,
                marketMoversCount:
                    m1.rippers.length + m1.dippers.length +
                    m5.rippers.length + m5.dippers.length +
                    m30.rippers.length + m30.dippers.length +
                    day.rippers.length + day.dippers.length,
                timestamp: new Date().toISOString()
            }
        })

    } catch (error: any) {
        console.error('[API Movers] TOP LEVEL CRASH:', error.message)
        return NextResponse.json({
            error: 'Fatal API error',
            message: error.message
        }, { status: 500 })
    }
}
