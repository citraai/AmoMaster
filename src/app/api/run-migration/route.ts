import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { sql } from "drizzle-orm";

// AI使用量カラム追加マイグレーション
export async function GET() {
    const results: string[] = [];

    try {
        await db.run(sql`ALTER TABLE users ADD COLUMN trial_start_date TEXT`);
        results.push("✅ trial_start_date 追加完了");
    } catch (e: unknown) {
        results.push(`⚠️ trial_start_date: ${e instanceof Error ? e.message : 'error'}`);
    }

    try {
        await db.run(sql`ALTER TABLE users ADD COLUMN ai_usage_count INTEGER NOT NULL DEFAULT 0`);
        results.push("✅ ai_usage_count 追加完了");
    } catch (e: unknown) {
        results.push(`⚠️ ai_usage_count: ${e instanceof Error ? e.message : 'error'}`);
    }

    try {
        await db.run(sql`ALTER TABLE users ADD COLUMN ai_usage_date TEXT`);
        results.push("✅ ai_usage_date 追加完了");
    } catch (e: unknown) {
        results.push(`⚠️ ai_usage_date: ${e instanceof Error ? e.message : 'error'}`);
    }

    try {
        await db.run(sql`ALTER TABLE users ADD COLUMN is_premium INTEGER NOT NULL DEFAULT 0`);
        results.push("✅ is_premium 追加完了");
    } catch (e: unknown) {
        results.push(`⚠️ is_premium: ${e instanceof Error ? e.message : 'error'}`);
    }

    return NextResponse.json({
        message: "AI使用量マイグレーション実行結果",
        results,
    });
}
