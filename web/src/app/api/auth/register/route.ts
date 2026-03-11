import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendAdminApprovalEmail } from "@/lib/mailer";

function hashPassword(password: string) {
    return bcrypt.hashSync(password, 10);
}

export async function POST(req: NextRequest) {
    try {
        let { name, email, password, role } = await req.json();

        // Default to user if not provided
        if (!role) role = "user";

        if (email) email = email.toLowerCase().trim();

        if (!email || !password) {
            return NextResponse.json(
                { message: "Missing email or password" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = hashPassword(password);
        const approvalToken = crypto.randomBytes(32).toString('hex');
        const displayName = name?.trim() || email.split("@")[0];

        // Step 1: Create user
        // AUTO-APPROVE if it's the site owner
        const ownerEmail = "jaswanthvellanki11@gmail.com";
        const isOwner = email === ownerEmail;

        const user = await prisma.user.create({
            data: {
                name: displayName,
                email,
                password: hashedPassword,
                role: role === "admin" || isOwner ? (isOwner ? "owner" : "admin") : "user",
                status: (role === "admin" && !isOwner) ? "pending" : "approved"
            },
        });

        // Step 2: Handle Approval/Email Logic
        if (role === 'admin' || isOwner) {
            await prisma.$executeRaw`
                UPDATE "User" 
                SET "approvalToken" = ${approvalToken}
                WHERE id = ${user.id}
            `;

            console.log(`[REGISTER] Processing ${role} registration for ${email}. isOwner: ${isOwner}`);

            // Step 3: Send approval email to owner
            try {
                await sendAdminApprovalEmail({
                    id: user.id,
                    name: displayName,
                    email,
                    approvalToken,
                });
                console.log(`[REGISTER] Approval/Verification email sent for ${email}`);
            } catch (mailErr) {
                console.error("[REGISTER] Failed to send email:", mailErr);
            }

            if (isOwner) {
                return NextResponse.json(
                    { message: "Owner account created and auto-approved.", approved: true },
                    { status: 201 }
                );
            }

            return NextResponse.json(
                {
                    message: "Registration successful. Awaiting admin approval.",
                    pending: true
                },
                { status: 201 }
            );
        }

        return NextResponse.json(
            {
                message: "Registration successful. You can now login.",
                pending: false
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Full Registration Error:", error);
        return NextResponse.json(
            {
                message: `Registration failed. Error: ${error.message || "Internal server error"}`,
                code: error.code || "UNKNOWN"
            },
            { status: 500 }
        );
    }
}
