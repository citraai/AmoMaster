// マイグレーションスクリプト - 新しいカラムを追加
import { db } from "./src/db/index";
import { sql } from "drizzle-orm";

async function migrate() {
    console.log("マイグレーション開始...");

    try {
        // trial_start_date カラム追加
        await db.run(sql`ALTER TABLE users ADD COLUMN trial_start_date TEXT`);
        console.log("✅ trial_start_date 追加完了");
    } catch (e) {
        console.log("⚠️ trial_start_date は既に存在するか、エラー:", e.message);
    }

    try {
        // ai_usage_count カラム追加
        await db.run(sql`ALTER TABLE users ADD COLUMN ai_usage_count INTEGER NOT NULL DEFAULT 0`);
        console.log("✅ ai_usage_count 追加完了");
    } catch (e) {
        console.log("⚠️ ai_usage_count は既に存在するか、エラー:", e.message);
    }

    try {
        // ai_usage_date カラム追加
        await db.run(sql`ALTER TABLE users ADD COLUMN ai_usage_date TEXT`);
        console.log("✅ ai_usage_date 追加完了");
    } catch (e) {
        console.log("⚠️ ai_usage_date は既に存在するか、エラー:", e.message);
    }

    try {
        // is_premium カラム追加
        await db.run(sql`ALTER TABLE users ADD COLUMN is_premium INTEGER NOT NULL DEFAULT 0`);
        console.log("✅ is_premium 追加完了");
    } catch (e) {
        console.log("⚠️ is_premium は既に存在するか、エラー:", e.message);
    }

    console.log("✅ マイグレーション完了！");
    process.exit(0);
}

migrate();
