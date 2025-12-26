/**
 * 地雷チェッカー - NGログとのマッチングでリスクを評価
 */

import * as dataService from "@/lib/data-service";
import type { Preference } from "@/lib/types";

export interface MineCheckResult {
    riskScore: number; // 0-100
    riskLevel: "safe" | "warning" | "danger";
    matchedNGs: {
        content: string;
        matchType: "exact" | "partial" | "similar";
        score: number;
    }[];
    advice: string;
}

/**
 * NGキーワードを取得（非同期・DB版）
 */
async function getNGRecordsAsync(): Promise<Preference[]> {
    try {
        const preferences = await dataService.getPreferences();
        return preferences.filter((p: Preference) => p.category === "ng");
    } catch (error) {
        console.error("[MineChecker] Error fetching NG records:", error);
        return [];
    }
}

/**
 * 日本語キーワードを抽出（漢字・カタカナ・ひらがなの連続）
 */
function extractKeywords(text: string): string[] {
    const keywords: string[] = [];

    // 漢字の連続を抽出（2文字以上）
    const kanjiMatches = text.match(/[\u4e00-\u9faf]+/g) || [];
    keywords.push(...kanjiMatches.filter(k => k.length >= 2));

    // カタカナの連続を抽出（2文字以上）
    const katakanaMatches = text.match(/[\u30a0-\u30ff]+/g) || [];
    keywords.push(...katakanaMatches.filter(k => k.length >= 2));

    // ひらがなの連続を抽出（3文字以上のみ）
    const hiraganaMatches = text.match(/[\u3040-\u309f]{3,}/g) || [];
    keywords.push(...hiraganaMatches);

    return keywords;
}

/**
 * 文字列の類似度を計算（日本語対応版）
 */
function calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    // 完全一致
    if (s1 === s2) return 100;

    // 部分一致（一方が他方を完全に含む）
    if (s1.includes(s2) || s2.includes(s1)) {
        return 70;
    }

    // キーワード抽出してマッチング
    const keywords1 = extractKeywords(str1);
    const keywords2 = extractKeywords(str2);

    let matchCount = 0;
    const matchedKeywords: string[] = [];

    for (const k1 of keywords1) {
        for (const k2 of keywords2) {
            // キーワードの完全一致
            if (k1 === k2) {
                matchCount += 2;
                if (!matchedKeywords.includes(k1)) {
                    matchedKeywords.push(k1);
                }
            }
            // キーワードの部分一致（一方が他方を含む）
            else if (k1.length >= 2 && k2.length >= 2 && (k1.includes(k2) || k2.includes(k1))) {
                matchCount += 1;
                const matched = k1.length > k2.length ? k2 : k1;
                if (!matchedKeywords.includes(matched)) {
                    matchedKeywords.push(matched);
                }
            }
        }
    }

    // 直接文字列に共通キーワードがあるかチェック
    for (const k of keywords2) {
        if (k.length >= 2 && s1.includes(k) && !matchedKeywords.includes(k)) {
            matchCount += 2;
            matchedKeywords.push(k);
        }
    }

    if (matchCount > 0) {
        // マッチ数に応じてスコア計算（最大80）
        return Math.min(80, matchCount * 20);
    }

    return 0;
}

/**
 * 入力テキストをNG記録と照合（非同期版）
 */
export async function checkMineAsync(input: string): Promise<MineCheckResult> {
    const ngRecords = await getNGRecordsAsync();
    const matchedNGs: MineCheckResult["matchedNGs"] = [];
    let totalScore = 0;

    for (const ng of ngRecords) {
        const similarity = calculateSimilarity(input, ng.content);

        if (similarity > 0) {
            let matchType: "exact" | "partial" | "similar";
            if (similarity >= 100) {
                matchType = "exact";
            } else if (similarity >= 50) {
                matchType = "partial";
            } else {
                matchType = "similar";
            }

            matchedNGs.push({
                content: ng.content,
                matchType,
                score: similarity,
            });

            totalScore += similarity;
        }
    }

    // スコアを0-100に正規化
    const riskScore = Math.min(100, totalScore);

    // リスクレベルと判定
    let riskLevel: MineCheckResult["riskLevel"];
    let advice: string;

    if (riskScore >= 70) {
        riskLevel = "danger";
        advice = "🚨 これは地雷だ！絶対にやめろ。パートナーが過去に嫌がったことに直接触れている。";
    } else if (riskScore >= 40) {
        riskLevel = "warning";
        advice = "⚠️ 注意が必要だ。過去のNG記録に似たパターンがある。もう一度考え直せ。";
    } else if (matchedNGs.length > 0) {
        riskLevel = "warning";
        advice = "🤔 少し気になる点がある。念のため、パートナーの反応をよく観察しろ。";
    } else {
        riskLevel = "safe";
        advice = "✅ 現在の記録では特に問題は見つからない。ただし油断するな、常にパートナーの反応を見ろ。";
    }

    return {
        riskScore,
        riskLevel,
        matchedNGs,
        advice,
    };
}

/**
 * 後方互換用同期版（空の結果を返す）
 * @deprecated 非同期版 checkMineAsync を使用してください
 */
export function checkMine(input: string): MineCheckResult {
    console.warn("[MineChecker] checkMine is deprecated, use checkMineAsync instead");
    return {
        riskScore: 0,
        riskLevel: "safe",
        matchedNGs: [],
        advice: "✅ チェック中... 非同期版を使用してください。",
    };
}

/**
 * リスクレベルに応じた色を取得
 */
export function getRiskColor(level: MineCheckResult["riskLevel"]): string {
    switch (level) {
        case "danger": return "text-red-500";
        case "warning": return "text-yellow-500";
        case "safe": return "text-green-500";
    }
}

/**
 * リスクレベルに応じたラベルを取得
 */
export function getRiskLabel(level: MineCheckResult["riskLevel"]): string {
    switch (level) {
        case "danger": return "危険";
        case "warning": return "注意";
        case "safe": return "安全";
    }
}
