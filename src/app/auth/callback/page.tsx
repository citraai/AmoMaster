"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import * as dataService from "@/lib/data-service";

export default function AuthCallbackPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [message, setMessage] = useState("ログイン処理中...");

    useEffect(() => {
        const checkProfileAndRedirect = async () => {
            if (status === "loading") return;

            if (status === "unauthenticated") {
                router.push("/login");
                return;
            }

            if (status === "authenticated") {
                try {
                    setMessage("プロファイルを確認中...");
                    const profile = await dataService.getUserProfile();

                    if (profile?.gender) {
                        // プロファイル設定済み → ホームへ
                        router.push("/");
                    } else {
                        // 新規ユーザー → オンボーディングへ
                        router.push("/onboarding");
                    }
                } catch (error) {
                    console.error("[AuthCallback] Profile check error:", error);
                    // エラー時は新規ユーザーとしてオンボーディングへ
                    router.push("/onboarding");
                }
            }
        };

        checkProfileAndRedirect();
    }, [status, router]);

    return (
        <div className="min-h-screen hero-pattern flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-white">{message}</p>
            </div>
        </div>
    );
}
