/**
 * AI Service - 統合AIサービス
 * 
 * Gemini Nano（ローカル）を優先し、
 * 利用不可の場合はOpenAI GPT-4o-miniにフォールバック。
 */

import { isNanoAvailable, generateWithNano } from "./gemini-nano";
import { isApiAvailable, generateWithApi } from "./openai-api";
import { buildRagContextAsync } from "./rag";
import { MASTER_SYSTEM_PROMPT } from "./prompts";

export type AIProvider = "nano" | "api" | "mock";

interface AIResponse {
    text: string;
    provider: AIProvider;
}

/**
 * 利用可能なAIプロバイダーを検出
 */
export async function detectProvider(): Promise<AIProvider> {
    console.log("[DEBUG] Detecting AI Provider...");

    // 1. Gemini Nano（ローカル）を優先
    if (await isNanoAvailable()) {
        console.log("[DEBUG] Provider: Nano");
        return "nano";
    }

    // 2. Gemini API（クラウド）
    if (isApiAvailable()) {
        console.log("[DEBUG] Provider: API");
        return "api";
    }

    // 3. フォールバック（モック）
    console.log("[DEBUG] Provider: Mock");
    return "mock";
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
export async function sendMessage(userMessage: string): Promise<AIResponse> {
    const provider = await detectProvider();

    // RAGコンテキストを構築（DBから非同期で取得）
    const ragContext = await buildRagContextAsync(userMessage);
    console.log("[DEBUG] RAG Context:", ragContext);

    // プロンプトを構築
    const fullPrompt = `${ragContext}\n\n---\nユーザーの質問: ${userMessage}`;

    let text: string | null = null;

    if (provider === "nano") {
        text = await generateWithNano(fullPrompt, MASTER_SYSTEM_PROMPT);
    } else if (provider === "api") {
        text = await generateWithApi(fullPrompt, MASTER_SYSTEM_PROMPT);
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
