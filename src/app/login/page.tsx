"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as dataService from "@/lib/data-service";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!agreedToTerms) {
            setError("利用規約とプライバシーポリシーに同意してください");
            return;
        }

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

                    {/* 利用規約・プライバシーポリシー同意 */}
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="agree-terms"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="mt-1 w-4 h-4 rounded border-white/30 bg-white/5 text-pink-500 focus:ring-pink-500 focus:ring-offset-0"
                        />
                        <label htmlFor="agree-terms" className="text-white/60 text-xs leading-relaxed">
                            <Link href="/terms" className="text-pink-400 underline hover:text-pink-300">利用規約</Link>
                            と
                            <Link href="/privacy" className="text-pink-400 underline hover:text-pink-300">プライバシーポリシー</Link>
                            に同意します
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !agreedToTerms}
                        className="w-full bg-gradient-to-r from-pink-600 to-red-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "読み込み中..." : "ログイン / 登録"}
                    </button>

                    <p className="text-white/40 text-xs text-center mt-4">
                        初めての方は自動的にアカウントが作成されます
                    </p>
                </form>

                {/* 将来のソーシャルログイン */}
                <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-white/10"></div>
                        <span className="text-white/40 text-xs">または</span>
                        <div className="flex-1 h-px bg-white/10"></div>
                    </div>

                    <button
                        disabled
                        className="w-full bg-white/5 border border-white/10 text-white/40 py-3 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                        <span>🔜</span>
                        <span className="text-sm">Google / LINE ログインは近日公開</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

