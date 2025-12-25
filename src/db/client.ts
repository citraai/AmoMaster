import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Turso接続設定
const tursoClient = createClient({
    url: process.env.TURSO_DATABASE_URL || process.env.NEXT_PUBLIC_TURSO_DATABASE_URL || "",
    authToken: process.env.TURSO_AUTH_TOKEN || process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN || "",
});

export const db = drizzle(tursoClient, { schema });

// 接続確認用
export async function testConnection() {
    try {
        await tursoClient.execute("SELECT 1");
        return true;
    } catch (error) {
        console.error("Turso connection failed:", error);
        return false;
    }
}
