/**
 * AI Chat API Route - サーバーサイドでOpenAI APIを呼び出す
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
    try {
        const { prompt, systemPrompt } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        // サーバーサイドで環境変数を取得
        const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

        if (!apiKey) {
            console.error("[AI Chat] API key not found");
            return NextResponse.json({ error: "API key not configured" }, { status: 500 });
        }

        const openai = new OpenAI({
            apiKey: apiKey,
        });

        console.log("[AI Chat] Calling OpenAI API...");

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
                { role: "user" as const, content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 512,
        });

        const text = response.choices[0]?.message?.content;

        if (text) {
            console.log("[AI Chat] ✅ Success");
            return NextResponse.json({ response: text });
        }

        return NextResponse.json({ error: "Empty response from AI" }, { status: 500 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("[AI Chat] ❌ Error:", errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
