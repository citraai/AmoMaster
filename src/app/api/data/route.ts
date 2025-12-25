/**
 * Data API Route - User-Scoped CRUD Operations
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import * as dbOps from "@/db/operations";

// GET - データ取得
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type");

        switch (type) {
            case "preferences":
                return NextResponse.json(await dbOps.getPreferences(userId));
            case "quotes":
                return NextResponse.json(await dbOps.getQuotes(userId));
            case "events":
                return NextResponse.json(await dbOps.getEvents(userId));
            case "settings":
                return NextResponse.json(await dbOps.getSettings(userId));
            case "progress":
                return NextResponse.json(await dbOps.getUserProgress(userId));
            case "profile":
                return NextResponse.json(await dbOps.getUserProfile(userId));
            case "all":
                return NextResponse.json({
                    preferences: await dbOps.getPreferences(userId),
                    quotes: await dbOps.getQuotes(userId),
                    events: await dbOps.getEvents(userId),
                    settings: await dbOps.getSettings(userId),
                    progress: await dbOps.getUserProgress(userId),
                });
            default:
                return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }
    } catch (error) {
        console.error("[API] GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST - データ作成
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const { type, data } = body;

        switch (type) {
            case "preference":
                return NextResponse.json(await dbOps.createPreference(userId, data));
            case "quote":
                return NextResponse.json(await dbOps.createQuote(userId, data));
            case "event":
                return NextResponse.json(await dbOps.createEvent(userId, data));
            case "settings":
                await dbOps.updateSettings(userId, data);
                return NextResponse.json({ success: true });
            case "progress":
                await dbOps.updateUserProgress(userId, data);
                return NextResponse.json({ success: true });
            case "profile":
                await dbOps.updateUserProfile(userId, data);
                return NextResponse.json({ success: true });
            default:
                return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }
    } catch (error) {
        console.error("[API] POST Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE - データ削除
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type");
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        switch (type) {
            case "preference":
                await dbOps.deletePreference(userId, id);
                return NextResponse.json({ success: true });
            case "quote":
                await dbOps.deleteQuote(userId, id);
                return NextResponse.json({ success: true });
            case "event":
                await dbOps.deleteEvent(userId, id);
                return NextResponse.json({ success: true });
            default:
                return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }
    } catch (error) {
        console.error("[API] DELETE Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
