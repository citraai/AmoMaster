/**
 * アカウント削除 API - App Store ガイドライン 5.1.1 準拠
 * POST /api/account/delete
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteUserAccount } from "@/db/operations";

export async function POST() {
    try {
        // 認証チェック
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "認証が必要です" },
                { status: 401 }
            );
        }

        const userId = session.user.email;

        // アカウント削除実行
        const result = await deleteUserAccount(userId);

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: "アカウントが正常に削除されました",
                deletedTables: result.deletedTables,
            });
        } else {
            return NextResponse.json(
                {
                    error: "アカウント削除中にエラーが発生しました",
                    deletedTables: result.deletedTables,
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("[DELETE /api/account/delete] Error:", error);
        return NextResponse.json(
            { error: "内部エラーが発生しました" },
            { status: 500 }
        );
    }
}
