/**
 * AmoMaster - データ型定義
 */

// 記録のカテゴリー
export type RecordCategory =
    | "like"      // 好きなもの
    | "quote"     // 言霊ログ
    | "gift"      // プレゼント
    | "place"     // 行きたい場所
    | "food"      // 食べたいもの
    | "ng";       // NG/地雷

// 嗜好品データ
export interface Preference {
    id: string;
    category: Exclude<RecordCategory, "quote">;
    content: string;
    tags?: string[];
    createdAt: string;
    notes?: string;
}

// 言霊データ
export interface Quote {
    id: string;
    content: string;
    context?: string; // どんな状況での発言か
    tags?: string[];
    createdAt: string;
}

// 統合記録型
export type Record = Preference | Quote;

// カテゴリーラベル
export const CATEGORY_LABELS: { [K in RecordCategory]: string } = {
    like: "好きなもの",
    quote: "言霊ログ",
    gift: "プレゼント",
    place: "行きたい場所",
    food: "食べたいもの",
    ng: "NG/地雷",
};

// カテゴリーアイコン
export const CATEGORY_ICONS: { [K in RecordCategory]: string } = {
    like: "❤️",
    quote: "💬",
    gift: "🎁",
    place: "📍",
    food: "🍽️",
    ng: "⚠️",
};

// ユニークIDを生成
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 日付フォーマット
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours === 0) {
            const minutes = Math.floor(diff / (1000 * 60));
            return minutes === 0 ? "たった今" : `${minutes}分前`;
        }
        return `${hours}時間前`;
    } else if (days === 1) {
        return "昨日";
    } else if (days < 7) {
        return `${days}日前`;
    } else {
        return date.toLocaleDateString("ja-JP", {
            month: "short",
            day: "numeric",
        });
    }
}

// イベントタイプ
export type EventType =
    | "birthday"    // 誕生日
    | "anniversary" // 記念日
    | "date"        // デート予定
    | "other";      // その他

// イベントデータ
export interface Event {
    id: string;
    type: EventType;
    title: string;
    date: string; // YYYY-MM-DD形式
    isRecurring: boolean; // 毎年繰り返すか
    notes?: string;
    createdAt: string;
}

// イベントタイプラベル
export const EVENT_TYPE_LABELS: { [K in EventType]: string } = {
    birthday: "誕生日",
    anniversary: "記念日",
    date: "デート",
    other: "その他",
};

// イベントタイプアイコン
export const EVENT_TYPE_ICONS: { [K in EventType]: string } = {
    birthday: "🎂",
    anniversary: "💕",
    date: "💑",
    other: "📌",
};

// 設定データ
export interface Settings {
    partnerName: string;
    partnerNickname?: string;
    startDate?: string; // 交際開始日
}

// カウントダウン計算
export function getDaysUntil(dateString: string, isRecurring: boolean = false): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);

    if (isRecurring) {
        // 今年の日付に設定
        targetDate.setFullYear(today.getFullYear());
        // もう過ぎていたら来年に
        if (targetDate < today) {
            targetDate.setFullYear(today.getFullYear() + 1);
        }
    }

    const diff = targetDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

