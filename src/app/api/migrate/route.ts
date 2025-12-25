/**
 * DB Migration API - Add password_hash column
 */

import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { sql } from "drizzle-orm";

export async function GET() {
    try {
        // Add password_hash column to users table
        await db.run(sql`ALTER TABLE users ADD COLUMN password_hash TEXT`);

        return NextResponse.json({
            success: true,
            message: "password_hash column added successfully"
        });
    } catch (error: unknown) {
        const err = error as Error;

        if (err.message?.includes("duplicate column name")) {
            return NextResponse.json({
                success: true,
                message: "password_hash column already exists"
            });
        }

        return NextResponse.json({
            success: false,
            error: err.message
        }, { status: 500 });
    }
}
