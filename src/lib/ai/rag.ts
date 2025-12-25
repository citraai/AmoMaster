/**
 * RAG (Retrieval Augmented Generation) - 関連記録検索
 * 
 * ユーザーの質問から関連する記録を抽出し、
 * AIに渡すコンテキストを構築する。
 */

import { Preference, Quote, CATEGORY_LABELS } from "@/lib/types";
import { getAllRecords, getSettings } from "@/lib/storage";

// 簡易キーワード抽出（形態素解析の代替）
const STOP_WORDS = new Set([
    "は", "が", "を", "に", "の", "で", "と", "も", "や", "か",
    "です", "ます", "だ", "ある", "いる", "する", "なる",
    "この", "その", "あの", "どの", "何", "どう", "なぜ",
    "彼女", "パートナー", "相手", "好き", "嫌い",
    "って", "という", "ということ", "こと", "もの",
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
        if (content.includes(kw)) score += 2;
        if (tags.includes(kw)) score += 1;
    }

    // 新しい記録を優先（過去30日以内）
    const daysAgo = (Date.now() - new Date(record.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysAgo < 30) score += 1;

    return score;
}

/**
 * 関連する記録を検索
 */
export function searchRelevantRecords(
    query: string,
    limit: number = 5
): (Preference | Quote)[] {
    const keywords = extractKeywords(query);
    if (keywords.length === 0) {
        // キーワードがなければ最新の記録を返す
        return getAllRecords().slice(0, limit);
    }

    const records = getAllRecords();
    const scored = records
        .map((r) => ({ record: r, score: scoreRecord(r, keywords) }))
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    return scored.map((s) => s.record);
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
 * RAGコンテキストを構築
 */
export function buildRagContext(query: string): string {
    const settings = getSettings();
    const relevantRecords = searchRelevantRecords(query, 5);

    if (relevantRecords.length === 0) {
        return `パートナー名: ${settings.partnerName}\n記録: まだ記録がありません`;
    }

    const compressed = relevantRecords.map(compressRecord).join("\n");
    return `パートナー名: ${settings.partnerName}\n\n関連する記録:\n${compressed}`;
}
