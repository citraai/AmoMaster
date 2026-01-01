import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// .env.local を読み込み
dotenv.config({ path: ".env.local" });

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "sqlite",
    driver: "d1-http",
    dbCredentials: {
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
        databaseId: "327aa538-8fbd-47da-af8e-8c405ca46367",
        token: process.env.CLOUDFLARE_API_TOKEN!,
    },
});
