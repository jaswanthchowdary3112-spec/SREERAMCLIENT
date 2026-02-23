import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { portfolio: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const holdings = user.portfolio.length > 0
            ? user.portfolio.map(h => ({
                ticker: h.ticker,
                shares: h.shares,
                avgCost: h.avgCost
            }))
            : [
                { ticker: 'AAPL', shares: 5, avgCost: 150.00 },
                { ticker: 'TSLA', shares: 2, avgCost: 200.00 }
            ];

        return NextResponse.json(holdings);
    } catch (error: any) {
        console.error('Error in portfolio API:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
