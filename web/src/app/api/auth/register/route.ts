import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// Helper to hash passwords consistently with auth.ts
// Use standard bcrypt for all new registrations
function hashPassword(password: string) {
    return bcrypt.hashSync(password, 10);
}

export async function POST(req: NextRequest) {
    try {
        let { name, email, password } = await req.json();

        if (email) email = email.toLowerCase().trim();

        if (!email || !password) {
            return NextResponse.json(
                { message: "Missing email or password" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name: name || email.split("@")[0],
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json(
            { message: "User created successfully", id: user.id },
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
