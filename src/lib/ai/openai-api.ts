/**
 * OpenAI API - GPT-4o-mini
 */

import OpenAI from "openai";

let openai: OpenAI | null = null;

/**
 * APIキーを取得
 */
function getApiKey(): string | null {
    if (typeof window === "undefined") return null;
    return process.env.NEXT_PUBLIC_OPENAI_API_KEY || null;
}

/**
 * OpenAI APIが利用可能かチェック
 */
export function isApiAvailable(): boolean {
    const hasKey = !!getApiKey();
    console.log("[DEBUG] OpenAI API Key:", hasKey ? "Found" : "Not Found");
    return hasKey;
}

/**
 * OpenAI APIで推論を実行
 */
export async function generateWithApi(
    prompt: string,
    systemPrompt?: string
): Promise<string | null> {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.warn("OpenAI API key not configured");
        return null;
    }

    try {
        // APIクライアントを初期化
        if (!openai) {
            openai = new OpenAI({
                apiKey: apiKey,
                dangerouslyAllowBrowser: true, // クライアントサイドで使用
            });
        }

        console.log("[DEBUG] Calling OpenAI API with gpt-4o-mini");

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
            console.log("[DEBUG] ✅ OpenAI API success");
            return text;
        }

        console.warn("[DEBUG] OpenAI API returned empty response");
        return null;
    } catch (error: any) {
        console.error("[DEBUG] ❌ OpenAI API error:", error?.message || error);
        return null;
    }
}
