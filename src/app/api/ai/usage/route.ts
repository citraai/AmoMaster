import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const DAILY_LIMIT = 3; // 1日のAI使用制限
const TRIAL_DAYS = 30; // トライアル期間（日）

// 今日の日付を取得 (YYYY-MM-DD)
function getTodayString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// トライアル期間内かチェック
function isInTrialPeriod(trialStartDate: string | null): boolean {
    if (!trialStartDate) return true; // 開始日がなければトライアル中とみなす

    const startDate = new Date(trialStartDate);
    const now = new Date();
    const diffTime = now.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays < TRIAL_DAYS;
}

// GET: AI使用状況を取得
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const today = getTodayString();
        const db = await getDb();

        // emailからユーザーを取得
        const result = await db.select().from(users).where(eq(users.email, session.user.email));
        const user = result[0];

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // トライアル期間チェック
        const inTrial = isInTrialPeriod(user.trialStartDate);
        const isPremium = user.isPremium || false;

        // 日付が変わっていたらカウントリセット
        let usageCount = user.aiUsageCount || 0;
        if (user.aiUsageDate !== today) {
            usageCount = 0;
        }

        // 残り回数計算
        const unlimited = inTrial || isPremium;
        const remainingCount = unlimited ? -1 : Math.max(0, DAILY_LIMIT - usageCount);
        const canUse = unlimited || remainingCount > 0;

        return NextResponse.json({
            usageCount,
            remainingCount, // -1は無制限
            dailyLimit: DAILY_LIMIT,
            canUse,
            inTrial,
            isPremium,
            trialDaysLeft: !user.trialStartDate
                ? TRIAL_DAYS // まだ開始していないなら30日
                : Math.max(0, TRIAL_DAYS - Math.floor((new Date().getTime() - new Date(user.trialStartDate).getTime()) / (1000 * 60 * 60 * 24))),
        });
    } catch (error) {
        console.error("[AI Usage] GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: AI使用回数をインクリメント
export async function POST() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const today = getTodayString();
        const db = await getDb();

        // emailからユーザーを取得
        const result = await db.select().from(users).where(eq(users.email, session.user.email));
        const user = result[0];

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // トライアル開始日がなければ設定
        let trialStartDate = user.trialStartDate;
        if (!trialStartDate) {
            trialStartDate = today;
        }

        // 日付が変わっていたらカウントリセット
        let newCount = (user.aiUsageCount || 0) + 1;
        if (user.aiUsageDate !== today) {
            newCount = 1;
        }

        // 使用制限チェック
        const inTrial = isInTrialPeriod(trialStartDate);
        const isPremium = user.isPremium || false;
        const unlimited = inTrial || isPremium;

        if (!unlimited && newCount > DAILY_LIMIT) {
            return NextResponse.json({
                error: "Daily limit reached",
                limitReached: true,
                canWatchAd: true, // 広告視聴オプション
            }, { status: 429 });
        }

        // カウント更新
        await db.update(users)
            .set({
                aiUsageCount: newCount,
                aiUsageDate: today,
                trialStartDate: trialStartDate,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(users.id, user.id));

        return NextResponse.json({
            success: true,
            usageCount: newCount,
            remainingCount: unlimited ? -1 : Math.max(0, DAILY_LIMIT - newCount),
        });
    } catch (error) {
        console.error("[AI Usage] POST Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
