/**
 * AI Service - 統合AIサービス
 * 
 * サーバーサイドAPIを経由してOpenAI GPT-4o-miniを使用。
 * Cloudflare Workers環境対応。
 */

import { isNanoAvailable, generateWithNano } from "./gemini-nano";
import { buildRagContextAsync } from "./rag";
import { getMasterSystemPrompt } from "./prompts";

export type AIProvider = "nano" | "api" | "mock";

interface AIResponse {
    text: string;
    provider: AIProvider;
}

/**
 * サーバーサイドAPIを使用してAI応答を取得
 */
async function callServerApi(prompt: string, systemPrompt: string): Promise<string | null> {
    try {

        const response = await fetch("/api/ai/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt, systemPrompt }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("[DEBUG] API error:", error);
            return null;
        }

        const data = await response.json();

        return data.response;
    } catch (error) {
        console.error("[DEBUG] ❌ Server API call failed:", error);
        return null;
    }
}

/**
 * 利用可能なAIプロバイダーを検出
 */
export async function detectProvider(): Promise<AIProvider> {


    // 1. Gemini Nano（ローカル）を優先
    if (await isNanoAvailable()) {

        return "nano";
    }

    // 2. サーバーサイドAPI（常に利用可能として扱う）

    return "api";
}

/**
 * モック応答を生成（AI非対応時）
 */
function generateMockResponse(query: string): string {
    const responses = [
        `ふーん、「${query.slice(0, 20)}...」ね。で、実際に行動に移したのか？口だけじゃパートナーは幸せにならないぞ 👊`,
        `なるほどな。お前、相談してくるのはいいが、まず記録しろ 📝 AIが本格稼働したらもっと的確に答えてやる`,
        `いい質問だ。でもその前に聞きたい。最後にパートナーにサプライズしたのはいつだ？ 😤`,
        `お前なりに考えてるのは認めてやる。でもな、考えてるだけじゃダメなんだよ。今すぐ行動しろ 🔥`,
        `正直に言うぞ。今はAIがフル稼働してないから、お前自身で考えろ。記録を見返して答えを探せ 📚`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * AIにメッセージを送信して応答を取得
 */
export async function sendMessage(userMessage: string, partnerNickname?: string): Promise<AIResponse> {
    const provider = await detectProvider();

    // RAGコンテキストを構築（DBから非同期で取得）
    const ragContext = await buildRagContextAsync(userMessage);


    // パートナーの呼び方を含めたシステムプロンプトを生成
    const systemPrompt = getMasterSystemPrompt(partnerNickname);

    // プロンプトを構築
    const fullPrompt = `${ragContext}\n\n---\nユーザーの質問: ${userMessage}`;

    let text: string | null = null;

    if (provider === "nano") {
        text = await generateWithNano(fullPrompt, systemPrompt);
    } else if (provider === "api") {
        // サーバーサイドAPIを使用
        text = await callServerApi(fullPrompt, systemPrompt);
    }

    // AIが失敗した場合はモックにフォールバック
    if (!text) {
        return {
            text: generateMockResponse(userMessage),
            provider: "mock",
        };
    }

    return { text, provider };
}

/**
 * プロバイダー名を日本語で取得
 */
export function getProviderLabel(provider: AIProvider): string {
    switch (provider) {
        case "nano":
            return "Gemini Nano（ローカル・無料）";
        case "api":
            return "OpenAI GPT-4o-mini";
        case "mock":
            return "デモモード";
    }
}
