/**
 * Feedback API Route - User Feedback Submission
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import * as dbOps from "@/db/operations";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const { type, content } = body;

        if (!type || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const result = await dbOps.createFeedback(userId, { type, content });

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error("[API] Feedback POST Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
