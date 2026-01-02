/**
 * Gemini API - Google公式SDKを使用
 * 
 * 無料枠で利用可能なモデルを自動選択
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

/**
 * APIキーを取得
 */
function getApiKey(): string | null {
    if (typeof window === "undefined") return null;
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY || null;
}

/**
 * Gemini APIが利用可能かチェック
 */
export function isApiAvailable(): boolean {
    const hasKey = !!getApiKey();

    return hasKey;
}

/**
 * Gemini APIで推論を実行
 */
export async function generateWithApi(
    prompt: string,
    systemPrompt?: string
): Promise<string | null> {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.warn("Gemini API key not configured");
        return null;
    }

    try {
        // APIクライアントを初期化
        if (!genAI) {
            genAI = new GoogleGenerativeAI(apiKey);
        }

        // 利用可能なモデルを試行（優先順位順）
        const modelNames = [
            "gemini-2.0-flash-exp",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-pro"
        ];

        for (const modelName of modelNames) {
            try {

                const model = genAI.getGenerativeModel({ model: modelName });

                // プロンプトを構築
                const fullPrompt = systemPrompt
                    ? `[System Instructions]\n${systemPrompt}\n\n[User Message]\n${prompt}`
                    : prompt;

                const result = await model.generateContent(fullPrompt);
                const response = result.response;
                const text = response.text();

                if (text) {

                    return text;
                }
            } catch (error: any) {
                const errorMessage = error?.message || String(error);
                console.warn(`[DEBUG] ❌ Model ${modelName} failed: ${errorMessage}`);

                // 次のモデルを試す
                if (modelName === modelNames[modelNames.length - 1]) {
                    // 最後のモデルも失敗
                    console.error("All Gemini models failed");
                }
                continue;
            }
        }

        return null;
    } catch (error) {
        console.error("Gemini API initialization failed:", error);
        return null;
    }
}
