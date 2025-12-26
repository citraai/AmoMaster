/**
 * RAG (Retrieval Augmented Generation) - 関連記録検索
 * 
 * ユーザーの質問から関連する記録を抽出し、
 * AIに渡すコンテキストを構築する。
 * 
 * データはTurso DBから取得する。
 */

import { Preference, Quote, CATEGORY_LABELS } from "@/lib/types";
import * as dataService from "@/lib/data-service";

// 簡易キーワード抽出（形態素解析の代替）
const STOP_WORDS = new Set([
    "は", "が", "を", "に", "の", "で", "と", "も", "や", "か",
    "です", "ます", "だ", "ある", "いる", "する", "なる",
    "この", "その", "あの", "どの", "何", "どう", "なぜ",
    "彼女", "パートナー", "相手", "好き", "嫌い",
    "って", "という", "ということ", "こと", "もの",
    "なんだっけ", "教えて", "知りたい", "ください",
]);

/**
 * テキストからキーワードを抽出
 */
function extractKeywords(text: string): string[] {
    // 記号・空白で分割
    const tokens = text
        .replace(/[。、！？\s]+/g, " ")
        .split(" ")
        .filter((t) => t.length >= 2)
        .filter((t) => !STOP_WORDS.has(t));

    return [...new Set(tokens)];
}

/**
 * 記録のスコアを計算
 */
function scoreRecord(record: Preference | Quote, keywords: string[]): number {
    let score = 0;
    const content = record.content.toLowerCase();
    const tags = record.tags?.join(" ").toLowerCase() || "";

    for (const keyword of keywords) {
        const kw = keyword.toLowerCase();
        if (content.includes(kw)) score += 3;
        if (tags.includes(kw)) score += 2;
    }

    // 新しい記録を優先（過去30日以内）
    const daysAgo = (Date.now() - new Date(record.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysAgo < 7) score += 2;
    else if (daysAgo < 30) score += 1;

    return score;
}

/**
 * 記録を圧縮フォーマットに変換
 */
function isQuote(record: Preference | Quote): record is Quote {
    return "context" in record;
}

export function compressRecord(record: Preference | Quote): string {
    const date = new Date(record.createdAt);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

    if (isQuote(record)) {
        const context = record.context ? ` (${record.context})` : "";
        return `[言葉] "${record.content}"${context} (${dateStr})`;
    } else {
        const category = CATEGORY_LABELS[record.category];
        const tags = record.tags?.length ? ` #${record.tags.join(" #")}` : "";
        return `[${category}] ${record.content}${tags} (${dateStr})`;
    }
}

/**
 * 関連する記録を検索（非同期版 - DBから取得）
 */
export async function searchRelevantRecordsAsync(
    query: string,
    limit: number = 10
): Promise<(Preference | Quote)[]> {
    try {
        // DBからデータを取得
        const [preferences, quotes] = await Promise.all([
            dataService.getPreferences(),
            dataService.getQuotes(),
        ]);

        const allRecords = [...preferences, ...quotes];

        if (allRecords.length === 0) {
            return [];
        }

        const keywords = extractKeywords(query);

        // キーワードがなければ全記録を返す（最新順）
        if (keywords.length === 0) {
            return allRecords
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, limit);
        }

        // スコアリングして関連度の高いものを返す
        const scored = allRecords
            .map((r) => ({ record: r, score: scoreRecord(r, keywords) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        return scored.map((s) => s.record);
    } catch (error) {
        console.error("[RAG] Error fetching records:", error);
        return [];
    }
}

/**
 * RAGコンテキストを構築（非同期版 - DBから取得）
 */
export async function buildRagContextAsync(query: string): Promise<string> {
    const settings = getSettings();
    const relevantRecords = await searchRelevantRecordsAsync(query, 10);

    let context = `パートナー名: ${settings.partnerName}\n`;
    context += `ユーザーが記録したパートナーの情報:\n`;

    if (relevantRecords.length === 0) {
        context += "（まだ記録がありません）";
    } else {
        // 全記録を圧縮形式で追加
        const compressed = relevantRecords.map(compressRecord).join("\n");
        context += compressed;
    }

    return context;
}

// 後方互換 - 非同期版を使用してください
/**
 * @deprecated buildRagContextAsync を使用してください
 */
export function searchRelevantRecords(): (Preference | Quote)[] {
    console.warn("[RAG] searchRelevantRecords is deprecated, use async version");
    return [];
}

/**
 * @deprecated buildRagContextAsync を使用してください
 */
export function buildRagContext(): string {
    console.warn("[RAG] buildRagContext is deprecated, use buildRagContextAsync");
    return "まだ記録がありません";
}
