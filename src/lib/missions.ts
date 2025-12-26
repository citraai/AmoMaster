/**
 * デイリーミッション + レベルシステム
 */

// ミッションタイプ
export type MissionType = "record" | "action" | "observe" | "communicate";

// ミッション定義
export interface Mission {
    id: string;
    type: MissionType;
    title: string;
    description: string;
    xp: number;
    icon: string;
    requiredCategory?: string; // 記録系ミッションの検証用カテゴリ
}

// レベル定義
export interface Level {
    level: number;
    requiredXp: number;
    title: string;
}

// ユーザー進捗
export interface UserProgress {
    xp: number;
    completedMissions: string[]; // 今日完了したミッションID
    lastMissionDate: string; // YYYY-MM-DD
    totalCompleted: number;
}

// レベルテーブル
export const LEVELS: Level[] = [
    { level: 1, requiredXp: 0, title: "初心者" },
    { level: 2, requiredXp: 50, title: "見習い" },
    { level: 3, requiredXp: 150, title: "一人前" },
    { level: 4, requiredXp: 300, title: "ベテラン" },
    { level: 5, requiredXp: 500, title: "パートナーマスター" },
    { level: 6, requiredXp: 800, title: "恋愛の達人" },
    { level: 7, requiredXp: 1200, title: "伝説" },
];

// ミッションプール
export const MISSION_POOL: Mission[] = [
    // 記録系（requiredCategoryで検証可能）
    { id: "record_like", type: "record", title: "好きなものを記録", description: "パートナーの好きなものを1つ記録しろ", xp: 10, icon: "💕", requiredCategory: "like" },
    { id: "record_food", type: "record", title: "食の好みを記録", description: "パートナーが食べたいものを記録しろ", xp: 10, icon: "🍽️", requiredCategory: "food" },
    { id: "record_place", type: "record", title: "行きたい場所を記録", description: "パートナーと行きたい場所を記録しろ", xp: 10, icon: "🗺️", requiredCategory: "place" },
    { id: "record_quote", type: "record", title: "言葉を記録", description: "パートナーが言った印象的な言葉を記録しろ", xp: 15, icon: "📝", requiredCategory: "quote" },
    { id: "record_gift", type: "record", title: "ギフトアイデア", description: "パートナーへのプレゼントアイデアを記録しろ", xp: 10, icon: "🎁", requiredCategory: "gift" },

    // 行動系（自己申告）
    { id: "action_snack", type: "action", title: "サプライズスイーツ", description: "帰りにお気に入りのスイーツを買って帰れ", xp: 20, icon: "🍰" },
    { id: "action_message", type: "action", title: "愛のメッセージ", description: "パートナーに「好き」とLINEしろ", xp: 15, icon: "💌" },
    { id: "action_hug", type: "action", title: "ハグミッション", description: "今日中にパートナーをハグしろ", xp: 15, icon: "🤗" },
    { id: "action_date", type: "action", title: "デートプラン", description: "次のデートプランをパートナーに提案しろ", xp: 25, icon: "📅" },

    // 観察系（自己申告）
    { id: "observe_clothes", type: "observe", title: "服装チェック", description: "今日のパートナーの服装を覚えておけ", xp: 10, icon: "👗" },
    { id: "observe_mood", type: "observe", title: "気分チェック", description: "パートナーの今日の気分を観察しろ", xp: 10, icon: "🔍" },
    { id: "observe_hair", type: "observe", title: "ヘアスタイル", description: "パートナーの髪型の変化に気づけ", xp: 15, icon: "💇" },

    // コミュニケーション系（自己申告）
    { id: "comm_praise", type: "communicate", title: "褒めミッション", description: "パートナーを3回褒めろ", xp: 20, icon: "👏" },
    { id: "comm_listen", type: "communicate", title: "傾聴ミッション", description: "パートナーの話を10分間しっかり聞け", xp: 15, icon: "👂" },
    { id: "comm_ask", type: "communicate", title: "質問ミッション", description: "パートナーに興味を持って質問しろ", xp: 15, icon: "❓" },
];

const PROGRESS_KEY = "herspecialist_user_progress";

// 進捗を取得
export function getUserProgress(): UserProgress {
    if (typeof window === "undefined") {
        return { xp: 0, completedMissions: [], lastMissionDate: "", totalCompleted: 0 };
    }

    const data = localStorage.getItem(PROGRESS_KEY);
    if (!data) {
        return { xp: 0, completedMissions: [], lastMissionDate: "", totalCompleted: 0 };
    }

    return JSON.parse(data);
}

// 進捗を保存
function saveUserProgress(progress: UserProgress): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

// 今日の日付を取得（ローカルタイムゾーン）
function getTodayString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// 今日の記録をチェックしてミッション達成を自動判定
export function checkAndCompleteRecordMissions(): void {
    const today = getTodayString();
    const todayMissions = getTodayMissions();
    const progress = getUserProgress();

    // 今日の記録を取得
    const allRecords = getAllTodayRecords();

    for (const mission of todayMissions) {
        // 記録系ミッションのみ
        if (mission.type !== "record" || !mission.requiredCategory) continue;

        // 既に達成済み
        if (progress.completedMissions.includes(mission.id)) continue;

        // 今日そのカテゴリの記録があるか確認
        const hasRecord = allRecords.some(r =>
            r.category === mission.requiredCategory &&
            r.createdAt.startsWith(today)
        );

        if (hasRecord) {
            // 自動達成
            completeMission(mission.id);
        }
    }
}

// 今日の全記録を取得（preferences + quotes）
function getAllTodayRecords(): Array<{ category: string; createdAt: string }> {
    if (typeof window === "undefined") return [];

    const today = getTodayString();
    const records: Array<{ category: string; createdAt: string }> = [];

    // Preferences
    const prefData = localStorage.getItem("herspecialist_preferences");
    if (prefData) {
        const prefs = JSON.parse(prefData);
        for (const p of prefs) {
            if (p.createdAt?.startsWith(today)) {
                records.push({ category: p.category, createdAt: p.createdAt });
            }
        }
    }

    // Quotes
    const quoteData = localStorage.getItem("herspecialist_quotes");
    if (quoteData) {
        const quotes = JSON.parse(quoteData);
        for (const q of quotes) {
            if (q.createdAt?.startsWith(today)) {
                records.push({ category: "quote", createdAt: q.createdAt });
            }
        }
    }

    return records;
}

// 今日の全記録を取得（DB版・非同期）
async function getAllTodayRecordsAsync(): Promise<Array<{ category: string; createdAt: string }>> {
    try {
        const { getPreferences, getQuotes } = await import("@/lib/data-service");
        const today = getTodayString();
        const records: Array<{ category: string; createdAt: string }> = [];

        // Preferences
        const prefs = await getPreferences();
        for (const p of prefs) {
            if (p.createdAt?.startsWith(today)) {
                records.push({ category: p.category, createdAt: p.createdAt });
            }
        }

        // Quotes
        const quotes = await getQuotes();
        for (const q of quotes) {
            if (q.createdAt?.startsWith(today)) {
                records.push({ category: "quote", createdAt: q.createdAt });
            }
        }

        return records;
    } catch (error) {
        console.error("[Missions] Error fetching records:", error);
        return [];
    }
}

// 非同期版: 今日の記録をチェックしてミッション達成を自動判定
export async function checkAndCompleteRecordMissionsAsync(): Promise<void> {
    try {
        const { getUserProgress: getDBProgress, updateUserProgress } = await import("@/lib/data-service");

        const today = getTodayString();
        const todayMissions = getTodayMissions();
        const progress = await getDBProgress();

        // 今日の記録を取得（DB版）
        const allRecords = await getAllTodayRecordsAsync();

        let updated = false;
        const completedMissions = progress.completedMissions || [];

        for (const mission of todayMissions) {
            // 記録系ミッションのみ
            if (mission.type !== "record" || !mission.requiredCategory) continue;

            // 既に達成済み
            if (completedMissions.includes(mission.id)) continue;

            // 今日そのカテゴリの記録があるか確認
            const hasRecord = allRecords.some(r =>
                r.category === mission.requiredCategory &&
                r.createdAt.startsWith(today)
            );

            if (hasRecord) {
                completedMissions.push(mission.id);
                progress.xp = (progress.xp || 0) + mission.xp;
                progress.totalCompleted = (progress.totalCompleted || 0) + 1;
                updated = true;
            }
        }

        if (updated) {
            await updateUserProgress({
                ...progress,
                completedMissions,
                lastMissionDate: today,
            });
        }
    } catch (error) {
        console.error("[Missions] Error checking missions:", error);
    }
}

// 今日のミッションを取得（3つ）
export function getTodayMissions(): Mission[] {
    const today = getTodayString();
    const progress = getUserProgress();

    // 日付が変わったらcompletedMissionsをリセット
    if (progress.lastMissionDate !== today) {
        progress.completedMissions = [];
        progress.lastMissionDate = today;
        saveUserProgress(progress);
    }

    // シード値として日付を使用（同じ日は同じミッション）
    const seed = today.split("-").join("");
    const shuffled = [...MISSION_POOL].sort((a, b) => {
        const hashA = hashCode(a.id + seed);
        const hashB = hashCode(b.id + seed);
        return hashA - hashB;
    });

    return shuffled.slice(0, 3);
}

// 簡易ハッシュ関数
function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

// ミッション完了
export function completeMission(missionId: string): { newXp: number; levelUp: boolean; newLevel: Level } {
    const mission = MISSION_POOL.find(m => m.id === missionId);
    if (!mission) return { newXp: 0, levelUp: false, newLevel: LEVELS[0] };

    const progress = getUserProgress();
    const oldLevel = getCurrentLevel(progress.xp);

    // 既に完了している場合
    if (progress.completedMissions.includes(missionId)) {
        return { newXp: progress.xp, levelUp: false, newLevel: oldLevel };
    }

    // XP追加
    progress.xp += mission.xp;
    progress.completedMissions.push(missionId);
    progress.totalCompleted++;
    progress.lastMissionDate = getTodayString();

    saveUserProgress(progress);

    const newLevel = getCurrentLevel(progress.xp);
    const levelUp = newLevel.level > oldLevel.level;

    return { newXp: progress.xp, levelUp, newLevel };
}

// 現在のレベルを取得
export function getCurrentLevel(xp: number): Level {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (xp >= LEVELS[i].requiredXp) {
            return LEVELS[i];
        }
    }
    return LEVELS[0];
}

// 次のレベルまでの進捗（0-100%）
export function getProgressToNextLevel(xp: number): number {
    const currentLevel = getCurrentLevel(xp);
    const currentLevelIndex = LEVELS.findIndex(l => l.level === currentLevel.level);

    if (currentLevelIndex >= LEVELS.length - 1) {
        return 100; // 最大レベル
    }

    const nextLevel = LEVELS[currentLevelIndex + 1];
    const xpInCurrentLevel = xp - currentLevel.requiredXp;
    const xpNeeded = nextLevel.requiredXp - currentLevel.requiredXp;

    return Math.floor((xpInCurrentLevel / xpNeeded) * 100);
}
