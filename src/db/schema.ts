import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Users テーブル（認証用）
export const users = sqliteTable("users", {
    id: text("id").primaryKey(), // メールアドレスをIDとして使用
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash"), // パスワードハッシュ
    name: text("name"),
    gender: text("gender"), // "male" | "female" | "other" | "unspecified"
    genderCustom: text("gender_custom"), // その他の場合の自由入力
    partnerPronoun: text("partner_pronoun"), // "he" | "she" | "partner"
    // 収益化関連
    trialStartDate: text("trial_start_date"), // トライアル開始日
    aiUsageCount: integer("ai_usage_count").notNull().default(0), // 今日のAI使用回数
    aiUsageDate: text("ai_usage_date"), // 使用日（日付リセット用）
    isPremium: integer("is_premium", { mode: "boolean" }).notNull().default(false), // プレミアム会員
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at"),
});

// Preferences テーブル
export const preferences = sqliteTable("preferences", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(), // ユーザーID追加
    category: text("category").notNull(), // "like" | "gift" | "place" | "food" | "ng"
    content: text("content").notNull(),
    tags: text("tags"), // JSON配列として保存
    createdAt: text("created_at").notNull(),
});

// Quotes テーブル
export const quotes = sqliteTable("quotes", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(), // ユーザーID追加
    content: text("content").notNull(),
    context: text("context"),
    tags: text("tags"), // JSON配列として保存
    createdAt: text("created_at").notNull(),
});

// Events テーブル
export const events = sqliteTable("events", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(), // ユーザーID追加
    type: text("type").notNull(), // "birthday" | "anniversary" | "date" | "other"
    title: text("title").notNull(),
    date: text("date").notNull(),
    isRecurring: integer("is_recurring", { mode: "boolean" }).notNull().default(false),
    notes: text("notes"),
    createdAt: text("created_at").notNull(),
});

// Settings テーブル
export const settings = sqliteTable("settings", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().unique(), // ユーザーID追加（1ユーザー1設定）
    partnerName: text("partner_name").notNull().default("パートナー"),
    partnerNickname: text("partner_nickname"),
    startDate: text("start_date"),
});

// Monthly Summaries テーブル
export const monthlySummaries = sqliteTable("monthly_summaries", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(), // ユーザーID追加
    yearMonth: text("year_month").notNull(), // "2024-12"
    summary: text("summary").notNull(),
    recordCount: integer("record_count").notNull(),
    createdAt: text("created_at").notNull(),
});

// User Progress テーブル（ミッション進捗）
export const userProgress = sqliteTable("user_progress", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().unique(),
    xp: integer("xp").notNull().default(0),
    totalCompleted: integer("total_completed").notNull().default(0),
    lastMissionDate: text("last_mission_date"),
    completedMissions: text("completed_missions"), // JSON配列
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at"),
});
