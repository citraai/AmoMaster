/**
 * ユーザープロファイルAPI
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import * as dbOps from "@/db/operations";

export async function GET() {
    try {
        const session = await auth();


        if (!session?.user?.id) {

            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const profile = await dbOps.getUserProfile(session.user.id);


        if (!profile) {

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


        return NextResponse.json(response);
    } catch (error) {
        console.error("[Profile API] Error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
