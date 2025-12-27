"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as dataService from "@/lib/data-service";

export default function SettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [partnerName, setPartnerName] = useState("パートナー");
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // 認証チェック
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // 設定読み込み
    useEffect(() => {
        async function loadSettings() {
            if (status !== "authenticated") return;
            try {
                const settings = await dataService.getSettings();
                setPartnerName(settings.partnerName || "パートナー");
            } catch (error) {
                console.error("設定読み込みエラー:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadSettings();
    }, [status]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await dataService.updateSettings({ partnerName });
            setSaveMessage("保存しました！");
        } catch (error) {
            console.error("保存エラー:", error);
            setSaveMessage("保存に失敗しました");
        }
        setIsSaving(false);
        setTimeout(() => setSaveMessage(""), 2000);
    };

    const handleLogout = async () => {
        if (confirm("ログアウトしますか？")) {
            await signOut({ callbackUrl: "/login" });
        }
    };

    // ローディング
    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen hero-pattern flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="text-4xl mb-4 animate-pulse">⚙️</div>
                    <p>読み込み中...</p>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") return null;

    return (
        <div className="min-h-screen hero-pattern">
            {/* ヘッダー */}
            <header className="sticky top-0 z-50 glass border-b border-white/5">
                <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors"
                        >
                            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-white font-bold text-lg">⚙️ 設定</h1>
                            <p className="text-white/40 text-[10px]">お前の戦闘準備を整えろ</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* メインコンテンツ */}
            <main className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-6">
                {/* アカウント情報 */}
                <section className="glass rounded-2xl p-4 border border-white/5">
                    <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <span>👤</span> アカウント
                    </h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-white/60 text-sm">メールアドレス</span>
                            <span className="text-white text-sm">{session?.user?.email}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                        >
                            🚪 ログアウト
                        </button>
                    </div>
                </section>

                {/* パートナー設定 */}
                <section className="glass rounded-2xl p-4 border border-white/5">
                    <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <span>💕</span> パートナー設定
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-white/60 text-xs mb-2">パートナーの呼び方</label>
                            <input
                                type="text"
                                value={partnerName}
                                onChange={(e) => setPartnerName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50"
                                placeholder="例: 彼女、彼、パートナー"
                            />
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {isSaving ? "保存中..." : "保存する"}
                        </button>
                        {saveMessage && (
                            <p className="text-center text-sm text-green-400">{saveMessage}</p>
                        )}
                    </div>
                </section>

                {/* アプリ情報 */}
                <section className="glass rounded-2xl p-4 border border-white/5">
                    <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <span>📱</span> アプリ情報
                    </h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-white/60">バージョン</span>
                            <span className="text-white">2.0.0 (AmoMaster)</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/60">フェーズ</span>
                            <span className="text-white">Phase 2</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/60">ストレージ</span>
                            <span className="text-white">Turso DB</span>
                        </div>
                    </div>
                </section>
            </main>

            {/* ボトムナビゲーション */}
            <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/5">
                <div className="max-w-lg mx-auto px-4">
                    <div className="flex items-center justify-around py-3">
                        <NavItem href="/" icon="/nav-home.png" label="ホーム" />
                        <NavItem href="/records" icon="/nav-records.png" label="記録" />
                        <NavItem href="/missions" icon="/nav-missions.png" label="ミッション" />
                        <NavItem href="/mine-checker" icon="/nav-danger.png" label="地雷" />
                        <NavItem href="/master" icon="/nav-master.png" label="マスター" />
                        <NavItem href="/settings" icon="/nav-settings.png" label="設定" active />
                    </div>
                </div>
            </nav>
        </div>
    );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: string; label: string; active?: boolean }) {
    const isImage = icon.startsWith('/');
    return (
        <Link
            href={href}
            className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${active
                ? "nav-item-active"
                : "opacity-60 hover:opacity-100"
                }`}
        >
            {isImage ? (
                <img src={icon} alt={label} className={`w-8 h-8 rounded-full object-cover ${active ? "scale-110" : ""} transition-transform`} />
            ) : (
                <span className={`text-xl ${active ? "scale-110" : ""} transition-transform`}>{icon}</span>
            )}
            <span className="text-[10px] font-medium">{label}</span>
        </Link>
    );
}
