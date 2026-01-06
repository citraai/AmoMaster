"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import * as dataService from "@/lib/data-service";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("ログインに失敗しました");
            } else {
                // プロファイルをチェック
                try {
                    const profile = await dataService.getUserProfile();
                    // プロファイルに性別が設定されていればホームへ
                    if (profile && profile.gender) {
                        router.push("/");
                    } else {
                        // 初回ユーザーはオンボーディングへ
                        router.push("/onboarding");
                    }
                } catch {
                    // エラー時はオンボーディングへ
                    router.push("/onboarding");
                }
            }
        } catch {
            setError("エラーが発生しました");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen hero-pattern flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* ロゴ/タイトル */}
                <div className="text-center mb-8">
                    <img src="/app-icon.png" alt="AmoMaster" className="w-16 h-16 mx-auto mb-4 rounded-2xl shadow-lg" />
                    <h1 className="text-white text-2xl font-bold mb-2">AmoMaster</h1>
                    <p className="text-white/60 text-sm">パートナーを理解する、最高の味方</p>
                </div>

                {/* ログインフォーム */}
                <form onSubmit={handleSubmit} className="card-dark p-6 space-y-4">
                    <h2 className="text-white text-lg font-bold text-center mb-4">ログイン / 新規登録</h2>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-white/60 text-sm mb-2">メールアドレス</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50"
                            placeholder="example@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-white/60 text-sm mb-2">パスワード</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-pink-600 to-red-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isLoading ? "読み込み中..." : "ログイン / 登録"}
                    </button>

                    <p className="text-white/40 text-xs text-center mt-4">
                        初めての方は自動的にアカウントが作成されます
                    </p>
                </form>

                {/* ソーシャルログイン */}
                <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-white/10"></div>
                        <span className="text-white/40 text-xs">または</span>
                        <div className="flex-1 h-px bg-white/10"></div>
                    </div>

                    {/* Googleログイン */}
                    <button
                        type="button"
                        onClick={() => signIn("google", { callbackUrl: "/" })}
                        className="w-full bg-white text-gray-800 font-medium py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Googleでログイン</span>
                    </button>

                    {/* LINEログイン */}
                    <button
                        type="button"
                        onClick={() => signIn("line", { callbackUrl: "/" })}
                        className="w-full bg-[#06C755] text-white font-medium py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-[#05B34C] transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                        </svg>
                        <span>LINEでログイン</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
