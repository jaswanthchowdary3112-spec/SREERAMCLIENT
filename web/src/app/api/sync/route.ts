import { NextResponse } from 'next/server';
import { updateMarketMovers } from '@/lib/market-service';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('[API Sync] Manual sync triggered');
        const result = await updateMarketMovers(2); // Process 2 at a time to stay under 5 calls/min limit
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('[API Sync] Sync failed:', error.message);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
