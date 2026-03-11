import { NextRequest, NextResponse } from "next/server";
import { sendAdminApprovalEmail } from "@/lib/mailer";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');

    // Simple security
    if (secret !== 'jaswanth-secret-123') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await sendAdminApprovalEmail({
            id: 'test-id',
            name: 'Test Administrator',
            email: 'test@example.com',
            approvalToken: 'test-token-123'
        });
        return NextResponse.json({ success: true, message: 'Test email sent to jaswanthvellanki11@gmail.com' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
