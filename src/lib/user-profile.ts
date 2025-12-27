/**
 * ユーザープロファイル管理
 */

export type Gender = "male" | "female" | "other" | "unspecified";
export type PartnerPronoun = "he" | "she" | "partner";

export interface UserProfile {
    gender: Gender | null;
    genderCustom: string | null;
    partnerPronoun: PartnerPronoun | null;
    setupCompleted: boolean;
    createdAt: string;
}

const PROFILE_KEY = "herspecialist_user_profile";

// デフォルトプロファイル
const defaultProfile: UserProfile = {
    gender: null,
    genderCustom: null,
    partnerPronoun: null,
    setupCompleted: false,
    createdAt: "",
};

// プロファイルを取得
export function getUserProfile(): UserProfile {
    if (typeof window === "undefined") return defaultProfile;

    const data = localStorage.getItem(PROFILE_KEY);
    if (!data) return defaultProfile;

    try {
        return JSON.parse(data);
    } catch {
        return defaultProfile;
    }
}

// プロファイルを保存
export function saveUserProfile(profile: Partial<UserProfile>): void {
    if (typeof window === "undefined") return;

    const current = getUserProfile();
    const updated = { ...current, ...profile };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
}

// セットアップ完了チェック
export function isProfileSetupCompleted(): boolean {
    const profile = getUserProfile();
    return profile.setupCompleted;
}

// パートナー呼称を取得（日本語）
export function getPartnerLabel(): string {
    const profile = getUserProfile();
    switch (profile.partnerPronoun) {
        case "he":
            return "彼";
        case "she":
            return "彼女";
        case "partner":
            return "パートナー";
        default:
            return "パートナー";
    }
}

// パートナーの所有格（〇〇の）
export function getPartnerPossessive(): string {
    return getPartnerLabel() + "の";
}

// 動的テキスト生成
export function getDynamicText(key: string): string {
    const partner = getPartnerLabel();

    const texts: Record<string, string> = {
        "like.title": `${partner}の好きなもの`,
        "ng.title": `${partner}のNG・地雷`,
        "gift.title": `${partner}へのギフト`,
        "place.title": `${partner}と行きたい場所`,
        "food.title": `${partner}が食べたいもの`,
        "quote.title": `${partner}の言葉`,
        "understanding.title": `${partner}理解度`,
    };

    return texts[key] || key;
}

// DB版: パートナー呼称を取得（非同期）
export async function getPartnerLabelFromDB(): Promise<string> {
    try {
        const response = await fetch("/api/user/profile");
        if (!response.ok) {
            return "パートナー"; // デフォルト
        }
        const profile = await response.json();

        switch (profile.partnerPronoun) {
            case "he":
                return "彼";
            case "she":
                return "彼女";
            case "partner":
            default:
                return "パートナー";
        }
    } catch (error) {
        console.error("[Profile] Error fetching partner label:", error);
        return "パートナー";
    }
}

// DB版: パートナーの呼び方を取得（非同期）
// ※DBのpartner_nameフィールドから取得
export async function getPartnerNicknameFromDB(): Promise<string | undefined> {
    try {
        const response = await fetch("/api/user/profile");
        if (!response.ok) {
            return undefined;
        }
        const profile = await response.json();
        // partner_name フィールドを使用（「あこちゃん」など）
        return profile.partnerName || undefined;
    } catch (error) {
        console.error("[Profile] Error fetching partner name:", error);
        return undefined;
    }
}
