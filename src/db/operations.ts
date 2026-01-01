/**
 * D1 DB Operations - Drizzle ORM CRUD (User-Scoped)
 */

import { getDb } from "./client";
import { preferences, quotes, events, settings, users, userProgress, feedback } from "./schema";
import { eq, and } from "drizzle-orm";

// より堅牢なハッシュ関数（大文字小文字区別あり）
function simpleHash(password: string): string {
    // パスワードに固定のsaltを追加
    const salted = `amomaster_salt_2024_${password}_end`;
    let hash = 5381;

    for (let i = 0; i < salted.length; i++) {
        // djb2アルゴリズムを使用
        hash = ((hash << 5) + hash) ^ salted.charCodeAt(i);
    }

    // 32ビット符号なし整数に変換してbase36エンコード
    return `v2_${(hash >>> 0).toString(36)}`;
}

// ==================== Users ====================

// ユーザー取得
export async function getUserByEmail(email: string) {
    const db = await getDb();
    const results = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return results[0] || null;
}

// ユーザー登録
export async function registerUser(email: string, password: string, name?: string) {
    const db = await getDb();
    const existing = await getUserByEmail(email);

    if (existing) {
        // 既存ユーザーがある場合はパスワードチェック
        if (existing.passwordHash && existing.passwordHash !== simpleHash(password)) {
            return null; // パスワード不一致
        }
        // パスワード未設定の場合は設定
        if (!existing.passwordHash) {
            await db.update(users)
                .set({ passwordHash: simpleHash(password) })
                .where(eq(users.email, email));
        }
        return existing;
    }

    // 新規ユーザー作成
    const id = email;
    const createdAt = new Date().toISOString();
    const passwordHash = simpleHash(password);
    const today = new Date();
    const trialStartDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    await db.insert(users).values({
        id,
        email,
        passwordHash,
        name: name || email.split("@")[0],
        createdAt,
        trialStartDate,
    });

    return { id, email, name: name || email.split("@")[0], createdAt, passwordHash, trialStartDate };
}

// 後方互換性のため残す
export async function getOrCreateUser(email: string, name?: string) {
    return registerUser(email, "temp_password", name);
}

export async function updateUserProfile(userId: string, data: {
    gender?: string;
    genderCustom?: string;
    partnerPronoun?: string;
}) {
    const db = await getDb();
    await db.update(users)
        .set({
            gender: data.gender,
            genderCustom: data.genderCustom,
            partnerPronoun: data.partnerPronoun,
            updatedAt: new Date().toISOString(),
        })
        .where(eq(users.id, userId));
}

export async function getUserProfile(userId: string) {
    const db = await getDb();
    const results = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return results[0] || null;
}

// ==================== Preferences ====================

export async function createPreference(userId: string, data: {
    category: string;
    content: string;
    tags?: string[];
}) {
    const db = await getDb();
    const id = `pref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    await db.insert(preferences).values({
        id,
        userId,
        category: data.category,
        content: data.content,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        createdAt,
    });

    return { id, userId, ...data, createdAt };
}

export async function getPreferences(userId: string) {
    const db = await getDb();
    return db.select().from(preferences).where(eq(preferences.userId, userId));
}

export async function deletePreference(userId: string, id: string) {
    const db = await getDb();
    await db.delete(preferences).where(and(eq(preferences.id, id), eq(preferences.userId, userId)));
}

export async function updatePreference(userId: string, id: string, data: {
    category?: string;
    content?: string;
    tags?: string[];
}) {
    const db = await getDb();
    await db.update(preferences)
        .set({
            category: data.category,
            content: data.content,
            tags: data.tags ? JSON.stringify(data.tags) : undefined,
        })
        .where(and(eq(preferences.id, id), eq(preferences.userId, userId)));
}

// ==================== Quotes ====================

export async function createQuote(userId: string, data: {
    content: string;
    context?: string;
    tags?: string[];
}) {
    const db = await getDb();
    const id = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    await db.insert(quotes).values({
        id,
        userId,
        content: data.content,
        context: data.context || null,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        createdAt,
    });

    return { id, userId, ...data, createdAt };
}

export async function getQuotes(userId: string) {
    const db = await getDb();
    return db.select().from(quotes).where(eq(quotes.userId, userId));
}

export async function deleteQuote(userId: string, id: string) {
    const db = await getDb();
    await db.delete(quotes).where(and(eq(quotes.id, id), eq(quotes.userId, userId)));
}

export async function updateQuote(userId: string, id: string, data: {
    content?: string;
    context?: string;
    tags?: string[];
}) {
    const db = await getDb();
    await db.update(quotes)
        .set({
            content: data.content,
            context: data.context,
            tags: data.tags ? JSON.stringify(data.tags) : undefined,
        })
        .where(and(eq(quotes.id, id), eq(quotes.userId, userId)));
}

// ==================== Events ====================

export async function createEvent(userId: string, data: {
    type: string;
    title: string;
    date: string;
    isRecurring?: boolean;
    notes?: string;
}) {
    const db = await getDb();
    const id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    await db.insert(events).values({
        id,
        userId,
        type: data.type,
        title: data.title,
        date: data.date,
        isRecurring: data.isRecurring || false,
        notes: data.notes || null,
        createdAt,
    });

    return { id, userId, ...data, createdAt };
}

export async function getEvents(userId: string) {
    const db = await getDb();
    return db.select().from(events).where(eq(events.userId, userId));
}

export async function deleteEvent(userId: string, id: string) {
    const db = await getDb();
    await db.delete(events).where(and(eq(events.id, id), eq(events.userId, userId)));
}

// ==================== Settings ====================

export async function getSettings(userId: string) {
    const db = await getDb();
    const results = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);
    return results[0] || null;
}

export async function upsertSettings(userId: string, data: {
    partnerName?: string;
    partnerNickname?: string;
    startDate?: string;
}) {
    const db = await getDb();
    const existing = await getSettings(userId);

    if (existing) {
        await db.update(settings)
            .set({
                partnerName: data.partnerName || existing.partnerName,
                partnerNickname: data.partnerNickname !== undefined ? data.partnerNickname : existing.partnerNickname,
                startDate: data.startDate !== undefined ? data.startDate : existing.startDate,
            })
            .where(eq(settings.userId, userId));
    } else {
        const id = `settings_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.insert(settings).values({
            id,
            userId,
            partnerName: data.partnerName || "パートナー",
            partnerNickname: data.partnerNickname || null,
            startDate: data.startDate || null,
        });
    }

    return getSettings(userId);
}

// ==================== User Progress ====================

export async function getUserProgress(userId: string) {
    const db = await getDb();
    const results = await db.select().from(userProgress).where(eq(userProgress.userId, userId)).limit(1);
    return results[0] || null;
}

export async function upsertUserProgress(userId: string, data: {
    xp?: number;
    totalCompleted?: number;
    lastMissionDate?: string;
    completedMissions?: string[];
}) {
    const db = await getDb();
    const existing = await getUserProgress(userId);
    const now = new Date().toISOString();

    if (existing) {
        await db.update(userProgress)
            .set({
                xp: data.xp !== undefined ? data.xp : existing.xp,
                totalCompleted: data.totalCompleted !== undefined ? data.totalCompleted : existing.totalCompleted,
                lastMissionDate: data.lastMissionDate !== undefined ? data.lastMissionDate : existing.lastMissionDate,
                completedMissions: data.completedMissions ? JSON.stringify(data.completedMissions) : existing.completedMissions,
                updatedAt: now,
            })
            .where(eq(userProgress.userId, userId));
    } else {
        const id = `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.insert(userProgress).values({
            id,
            userId,
            xp: data.xp || 0,
            totalCompleted: data.totalCompleted || 0,
            lastMissionDate: data.lastMissionDate || null,
            completedMissions: data.completedMissions ? JSON.stringify(data.completedMissions) : null,
            createdAt: now,
            updatedAt: now,
        });
    }

    return getUserProgress(userId);
}

// ==================== AI Usage ====================

export async function checkAndIncrementAIUsage(userId: string): Promise<{ allowed: boolean; remaining: number; isTrialActive: boolean }> {
    const db = await getDb();
    const DAILY_LIMIT = 3;
    const TRIAL_DAYS = 30;

    const user = await getUserProfile(userId);
    if (!user) {
        return { allowed: false, remaining: 0, isTrialActive: false };
    }

    // プレミアムユーザーは無制限
    if (user.isPremium) {
        return { allowed: true, remaining: 999, isTrialActive: false };
    }

    // トライアル期間チェック
    const trialStart = user.trialStartDate ? new Date(user.trialStartDate) : null;
    const now = new Date();
    const isTrialActive = trialStart ? (now.getTime() - trialStart.getTime()) < TRIAL_DAYS * 24 * 60 * 60 * 1000 : false;

    if (!isTrialActive) {
        return { allowed: false, remaining: 0, isTrialActive: false };
    }

    // 日付チェックとリセット
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    let currentCount = user.aiUsageCount || 0;

    if (user.aiUsageDate !== today) {
        // 日付が変わったらリセット
        currentCount = 0;
    }

    if (currentCount >= DAILY_LIMIT) {
        return { allowed: false, remaining: 0, isTrialActive: true };
    }

    // 使用回数をインクリメント
    await db.update(users)
        .set({
            aiUsageCount: currentCount + 1,
            aiUsageDate: today,
            updatedAt: new Date().toISOString(),
        })
        .where(eq(users.id, userId));

    return { allowed: true, remaining: DAILY_LIMIT - currentCount - 1, isTrialActive: true };
}

// ==================== 統合データ取得 ====================

export async function getAllUserData(userId: string) {
    const [prefs, quoteList, eventList, userSettings, progress] = await Promise.all([
        getPreferences(userId),
        getQuotes(userId),
        getEvents(userId),
        getSettings(userId),
        getUserProgress(userId),
    ]);

    return {
        preferences: prefs,
        quotes: quoteList,
        events: eventList,
        settings: userSettings,
        progress,
    };
}

// ==================== アカウント削除 ====================

export async function deleteUserAccount(userId: string): Promise<void> {
    const db = await getDb();
    // すべての関連データを削除
    await db.delete(preferences).where(eq(preferences.userId, userId));
    await db.delete(quotes).where(eq(quotes.userId, userId));
    await db.delete(events).where(eq(events.userId, userId));
    await db.delete(settings).where(eq(settings.userId, userId));
    await db.delete(userProgress).where(eq(userProgress.userId, userId));
    // 最後にユーザー自体を削除
    await db.delete(users).where(eq(users.id, userId));
}

// ==================== Feedback ====================

export async function createFeedback(userId: string, data: {
    type: string;
    content: string;
}) {
    const db = await getDb();
    const id = `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    await db.insert(feedback).values({
        id,
        userId,
        type: data.type,
        content: data.content,
        createdAt,
    });

    return { id, userId, ...data, createdAt };
}

