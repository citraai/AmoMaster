/**
 * Gemini Nano (Chrome AI) - ローカルAI処理
 * 
 * Chrome 127+でサポート。無料でローカル推論可能。
 * https://developer.chrome.com/docs/ai/built-in
 */

// Chrome AI APIの型定義
interface ChromeAI {
    canCreateTextSession(): Promise<"readily" | "after-download" | "no">;
    createTextSession(options?: {
        systemPrompt?: string;
        temperature?: number;
        topK?: number;
    }): Promise<AITextSession>;
}

interface AITextSession {
    prompt(input: string): Promise<string>;
    promptStreaming(input: string): ReadableStream<string>;
    destroy(): void;
}

declare global {
    interface Window {
        ai?: ChromeAI;
    }
}

let session: AITextSession | null = null;

/**
 * Gemini Nanoが利用可能かチェック
 */
export async function isNanoAvailable(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    if (!window.ai) return false;

    try {
        const status = await window.ai.canCreateTextSession();
        return status === "readily" || status === "after-download";
    } catch {
        return false;
    }
}

/**
 * Nanoセッションを取得または作成
 */
async function getSession(systemPrompt?: string): Promise<AITextSession | null> {
    if (!window.ai) return null;

    if (session) return session;

    try {
        session = await window.ai.createTextSession({
            systemPrompt,
            temperature: 0.7,
            topK: 40,
        });
        return session;
    } catch {
        return null;
    }
}

/**
 * Gemini Nanoで推論を実行
 */
export async function generateWithNano(
    prompt: string,
    systemPrompt?: string
): Promise<string | null> {
    const sess = await getSession(systemPrompt);
    if (!sess) return null;

    try {
        return await sess.prompt(prompt);
    } catch (error) {
        console.error("Nano generation error:", error);
        // セッションをリセット
        session?.destroy();
        session = null;
        return null;
    }
}

/**
 * セッションをクリーンアップ
 */
export function destroyNanoSession(): void {
    session?.destroy();
    session = null;
}
