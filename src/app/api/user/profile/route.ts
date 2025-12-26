/**
 * ユーザープロファイルAPI
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await db
            .select()
            .from(users)
            .where(eq(users.email, session.user.email))
            .limit(1);

        if (user.length === 0) {
            return NextResponse.json({
                partnerPronoun: "partner",
                gender: null,
            });
        }

        return NextResponse.json({
            partnerPronoun: user[0].partnerPronoun || "partner",
            gender: user[0].gender,
            name: user[0].name,
        });
    } catch (error) {
        console.error("[API] Profile error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
