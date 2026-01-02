/**
 * Diary API Route - 日記機能
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import * as dbOps from "@/db/operations";
import OpenAI from "openai";

// 日記分析用のシステムプロンプト
const DIARY_INSIGHT_PROMPT = `あなたは「恋愛マスター」です。ユーザーの日記を読んで、パートナーとの関係に関する短い分析・アドバイスを提供します。

## ルール
- 2-3文で簡潔に回答
- パートナーとの関係改善のヒントを含める
- 毒舌だが愛情深いトーンで
- 敬語は使わない

## 出力例
「パートナーと楽しい時間を過ごせたようだな。でもその楽しさ、ちゃんと言葉で伝えたか？」
「ちょっと疲れてるみたいだな。こういう時こそ、パートナーに頼ることも大切だぞ」`;

// AI分析を生成
async function generateDiaryInsight(content: string, mood?: string): Promise<string | null> {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
        console.error("[Diary] OpenAI API key not found");
        return null;
    }

    try {
        const openai = new OpenAI({ apiKey });

        const userPrompt = mood
            ? `今日の気分: ${mood}\n\n日記内容:\n${content}`
            : `日記内容:\n${content}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: DIARY_INSIGHT_PROMPT },
                { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 150,
        });

        return response.choices[0]?.message?.content || null;
    } catch (error) {
        console.error("[Diary] AI insight generation failed:", error);
        return null;
    }
}

// 日記一覧取得
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

        const entries = await dbOps.getDiaryEntries(userId, limit);

        return NextResponse.json({ success: true, data: entries });
    } catch (error) {
        console.error("[API] Diary GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// 日記作成
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const { content, mood, generateInsight } = body;

        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        let aiInsight: string | undefined;

        // AI分析を生成（オプション）
        if (generateInsight) {
            const insight = await generateDiaryInsight(content, mood);
            if (insight) {
                aiInsight = insight;
            }
        }

        const result = await dbOps.createDiaryEntry(userId, { content, mood, aiInsight });

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error("[API] Diary POST Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// 日記更新
export async function PUT(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const { id, content, mood } = body;

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const result = await dbOps.updateDiaryEntry(userId, id, { content, mood });

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error("[API] Diary PUT Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// 日記削除
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await dbOps.deleteDiaryEntry(userId, id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[API] Diary DELETE Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
