import { drizzle } from "drizzle-orm/d1";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema";
import { getRequestContext } from "@cloudflare/next-on-pages";

export type Database = DrizzleD1Database<typeof schema>;

// D1データベースインスタンスを取得する関数
// Cloudflare Workers環境では、D1はenv.DBとしてバインドされる
export function getDb(): Database {
    const { env } = getRequestContext();
    const d1 = (env as { DB: D1Database }).DB;
    return drizzle(d1, { schema });
}

// グローバルdbプロキシ（後方互換性のため）
// 注意: これはリクエストコンテキスト内でのみ動作する
export const db = new Proxy({} as Database, {
    get(_target, prop) {
        return (getDb() as unknown as Record<string, unknown>)[prop];
    },
});

// SQL ヘルパーをエクスポート
import { sql } from "drizzle-orm";
export { sql };

// 接続確認用
export async function testConnection(): Promise<boolean> {
    try {
        const database = getDb();
        await database.run(sql`SELECT 1`);
        return true;
    } catch (error) {
        console.error("D1 connection failed:", error);
        return false;
    }
}
