/**
 * Turso DB Operations - Drizzle ORM CRUD (User-Scoped)
 */

import { db } from "./client";
import { preferences, quotes, events, settings, users, userProgress } from "./schema";
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
    const results = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return results[0] || null;
}

// ユーザー登録
export async function registerUser(email: string, password: string, name?: string) {
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
        trialStartDate, // トライアル開始日
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
    const results = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return results[0] || null;
}

// ==================== Preferences ====================

export async function createPreference(userId: string, data: {
    category: string;
    content: string;
    tags?: string[];
}) {
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
    const results = await db.select().from(preferences).where(eq(preferences.userId, userId));

    return results.map(row => ({
        id: row.id,
        category: row.category,
        content: row.content,
        tags: row.tags ? JSON.parse(row.tags) : undefined,
        createdAt: row.createdAt,
    }));
}

export async function updatePreference(userId: string, id: string, data: {
    category?: string;
    content?: string;
    tags?: string[];
}) {
    const updateData: Record<string, unknown> = {};

    if (data.category) updateData.category = data.category;
    if (data.content) updateData.content = data.content;
    if (data.tags !== undefined) updateData.tags = data.tags ? JSON.stringify(data.tags) : null;

    await db.update(preferences)
        .set(updateData)
        .where(and(eq(preferences.id, id), eq(preferences.userId, userId)));
}

export async function deletePreference(userId: string, id: string) {
    await db.delete(preferences).where(and(eq(preferences.id, id), eq(preferences.userId, userId)));
}

// ==================== Quotes ====================

export async function createQuote(userId: string, data: {
    content: string;
    context?: string;
    tags?: string[];
}) {
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
    const results = await db.select().from(quotes).where(eq(quotes.userId, userId));

    return results.map(row => ({
        id: row.id,
        content: row.content,
        context: row.context || undefined,
        tags: row.tags ? JSON.parse(row.tags) : undefined,
        createdAt: row.createdAt,
    }));
}

export async function deleteQuote(userId: string, id: string) {
    await db.delete(quotes).where(and(eq(quotes.id, id), eq(quotes.userId, userId)));
}

export async function updateQuote(userId: string, id: string, data: {
    content?: string;
    context?: string;
    tags?: string[];
}) {
    const updateData: Record<string, unknown> = {};

    if (data.content) updateData.content = data.content;
    if (data.context !== undefined) updateData.context = data.context || null;
    if (data.tags !== undefined) updateData.tags = data.tags ? JSON.stringify(data.tags) : null;

    await db.update(quotes)
        .set(updateData)
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
    const results = await db.select().from(events).where(eq(events.userId, userId));

    return results.map(row => ({
        id: row.id,
        type: row.type,
        title: row.title,
        date: row.date,
        isRecurring: Boolean(row.isRecurring),
        notes: row.notes || undefined,
        createdAt: row.createdAt,
    }));
}

export async function deleteEvent(userId: string, id: string) {
    await db.delete(events).where(and(eq(events.id, id), eq(events.userId, userId)));
}

// ==================== Settings ====================

export async function getSettings(userId: string) {
    const results = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);

    if (results.length === 0) {
        // デフォルト設定を作成
        const id = `settings_${userId}`;
        await db.insert(settings).values({
            id,
            userId,
            partnerName: "パートナー",
            partnerNickname: null,
            startDate: null,
        });

        return { partnerName: "パートナー" };
    }

    const row = results[0];
    return {
        partnerName: row.partnerName,
        partnerNickname: row.partnerNickname || undefined,
        startDate: row.startDate || undefined,
    };
}

export async function updateSettings(userId: string, data: {
    partnerName?: string;
    partnerNickname?: string;
    startDate?: string;
}) {
    const existing = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);

    if (existing.length === 0) {
        await db.insert(settings).values({
            id: `settings_${userId}`,
            userId,
            partnerName: data.partnerName || "パートナー",
            partnerNickname: data.partnerNickname || null,
            startDate: data.startDate || null,
        });
    } else {
        await db.update(settings)
            .set({
                partnerName: data.partnerName,
                partnerNickname: data.partnerNickname || null,
                startDate: data.startDate || null,
            })
            .where(eq(settings.userId, userId));
    }
}

// ==================== User Progress (Missions) ====================

export async function getUserProgress(userId: string) {
    const results = await db.select().from(userProgress).where(eq(userProgress.userId, userId)).limit(1);

    if (results.length === 0) {
        return {
            xp: 0,
            totalCompleted: 0,
            lastMissionDate: null,
            completedMissions: [],
        };
    }

    const row = results[0];
    return {
        xp: row.xp,
        totalCompleted: row.totalCompleted,
        lastMissionDate: row.lastMissionDate,
        completedMissions: row.completedMissions ? JSON.parse(row.completedMissions) : [],
    };
}

export async function updateUserProgress(userId: string, data: {
    xp: number;
    totalCompleted: number;
    lastMissionDate: string;
    completedMissions: string[];
}) {
    const existing = await db.select().from(userProgress).where(eq(userProgress.userId, userId)).limit(1);

    if (existing.length === 0) {
        await db.insert(userProgress).values({
            id: `progress_${userId}`,
            userId,
            xp: data.xp,
            totalCompleted: data.totalCompleted,
            lastMissionDate: data.lastMissionDate,
            completedMissions: JSON.stringify(data.completedMissions),
            createdAt: new Date().toISOString(),
        });
    } else {
        await db.update(userProgress)
            .set({
                xp: data.xp,
                totalCompleted: data.totalCompleted,
                lastMissionDate: data.lastMissionDate,
                completedMissions: JSON.stringify(data.completedMissions),
                updatedAt: new Date().toISOString(),
            })
            .where(eq(userProgress.userId, userId));
    }
}

// ==================== Account Deletion ====================

/**
 * アカウント削除 - App Store ガイドライン 5.1.1 準拠
 * ユーザーとその全関連データを完全に削除
 */
export async function deleteUserAccount(userId: string): Promise<{ success: boolean; deletedTables: string[] }> {
    const deletedTables: string[] = [];

    try {
        // 1. Preferences削除
        await db.delete(preferences).where(eq(preferences.userId, userId));
        deletedTables.push("preferences");

        // 2. Quotes削除
        await db.delete(quotes).where(eq(quotes.userId, userId));
        deletedTables.push("quotes");

        // 3. Events削除
        await db.delete(events).where(eq(events.userId, userId));
        deletedTables.push("events");

        // 4. Settings削除
        await db.delete(settings).where(eq(settings.userId, userId));
        deletedTables.push("settings");

        // 5. User Progress削除
        await db.delete(userProgress).where(eq(userProgress.userId, userId));
        deletedTables.push("userProgress");

        // 6. User本体を削除（最後に実行）
        await db.delete(users).where(eq(users.id, userId));
        deletedTables.push("users");

        return { success: true, deletedTables };
    } catch (error) {
        console.error("[deleteUserAccount] Error:", error);
        return { success: false, deletedTables };
    }
}
