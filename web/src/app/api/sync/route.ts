import { NextResponse } from 'next/server';
import { updateMarketMovers } from '@/lib/market-service';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const force = searchParams.get('force') === 'true';
        const resetParam = searchParams.get('reset');
        
        // If reset=TICKER1,TICKER2,... is provided, delete those records so they get re-fetched
        if (resetParam) {
            const tickers = resetParam.split(',').map(t => t.trim().toUpperCase()).filter(Boolean);
            if (tickers.length > 0) {
                const deleted = await prisma.marketMover.deleteMany({
                    where: { ticker: { in: tickers } }
                });
                console.log(`[API Sync] Force-reset ${deleted.count} records for: ${tickers.join(', ')}`);
                return NextResponse.json({ success: true, message: `Reset ${deleted.count} records. Now run /api/sync to re-fetch.`, reset: tickers });
            }
        }
        
        console.log(`[API Sync] Manual sync triggered${force ? ' (FORCED)' : ''}`);
        const result = await updateMarketMovers(20, force); // Process 20 at a time
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('[API Sync] Sync failed:', error.message);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
