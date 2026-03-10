import { NextResponse } from 'next/server';
import { updateMarketMovers } from '@/lib/market-service';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('[API Sync] Manual sync triggered');
        const result = await updateMarketMovers(20); // Process 20 at a time to avoid timeout
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('[API Sync] Sync failed:', error.message);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
