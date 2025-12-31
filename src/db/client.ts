import { createClient, Client } from "@libsql/client";
import { drizzle, LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

// 遅延初期化用の変数
let tursoClient: Client | null = null;
let drizzleDb: LibSQLDatabase<typeof schema> | null = null;

// Tursoクライアントを取得（遅延初期化）
function getTursoClient(): Client {
    if (!tursoClient) {
        const url = process.env.TURSO_DATABASE_URL || process.env.NEXT_PUBLIC_TURSO_DATABASE_URL || "";
        const authToken = process.env.TURSO_AUTH_TOKEN || process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN || "";

        if (!url) {
            throw new Error("TURSO_DATABASE_URL is not set");
        }

        tursoClient = createClient({ url, authToken });
    }
    return tursoClient;
}

// Drizzle DBインスタンスを取得（遅延初期化）
function getDb(): LibSQLDatabase<typeof schema> {
    if (!drizzleDb) {
        drizzleDb = drizzle(getTursoClient(), { schema });
    }
    return drizzleDb;
}

// 後方互換性のためのプロキシ
export const db = new Proxy({} as LibSQLDatabase<typeof schema>, {
    get(_target, prop) {
        return (getDb() as any)[prop];
    },
});

// 接続確認用
export async function testConnection() {
    try {
        await getTursoClient().execute("SELECT 1");
        return true;
    } catch (error) {
        console.error("Turso connection failed:", error);
        return false;
    }
}
