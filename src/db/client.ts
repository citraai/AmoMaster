import { drizzle } from "drizzle-orm/d1";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema";
import { sql } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export type Database = DrizzleD1Database<typeof schema>;

// D1データベースインスタンスを取得する関数
export async function getDb(): Promise<Database> {
    const { env } = await getCloudflareContext();
    const d1 = (env as { DB: D1Database }).DB;
    return drizzle(d1, { schema });
}

// SQL ヘルパーをエクスポート
export { sql };

// 接続確認用
export async function testConnection(): Promise<boolean> {
    try {
        const database = await getDb();
        await database.run(sql`SELECT 1`);
        return true;
    } catch (error) {
        console.error("D1 connection failed:", error);
        return false;
    }
}
