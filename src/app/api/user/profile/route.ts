/**
 * ユーザープロファイルAPI
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import * as dbOps from "@/db/operations";

export const runtime = "edge";

export async function GET() {
    try {
        const session = await auth();
        console.log("[Profile API] Session:", session?.user?.email, session?.user?.id);

        if (!session?.user?.id) {
            console.log("[Profile API] No session user ID");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const profile = await dbOps.getUserProfile(session.user.id);
        console.log("[Profile API] Profile from DB:", profile);

        if (!profile) {
            console.log("[Profile API] No profile found, returning default");
            return NextResponse.json({
                partnerPronoun: "partner",
                gender: null,
            });
        }

        const response = {
            partnerPronoun: profile.partnerPronoun || "partner",
            gender: profile.gender,
            name: profile.name,
            partnerName: profile.partnerName,  // パートナーの呼び方
        };
        console.log("[Profile API] Returning:", response);

        return NextResponse.json(response);
    } catch (error) {
        console.error("[Profile API] Error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
