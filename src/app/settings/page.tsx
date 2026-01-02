"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as dataService from "@/lib/data-service";
import FeedbackModal from "@/components/FeedbackModal";

export default function SettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [partnerName, setPartnerName] = useState("パートナー");
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // アカウント削除関連のstate
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

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

    // アカウント削除処理
    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== "削除する") {
            setDeleteError("「削除する」と入力してください");
            return;
        }

        setIsDeleting(true);
        setDeleteError("");

        try {
            const result = await dataService.deleteAccount();

            if (result.success) {
                // ログアウトしてログイン画面へ
                await signOut({ callbackUrl: "/login" });
            } else {
                setDeleteError(result.error || "削除に失敗しました");
            }
        } catch (error) {
            console.error("アカウント削除エラー:", error);
            setDeleteError("エラーが発生しました");
        } finally {
            setIsDeleting(false);
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
                            <span className="text-white">Cloudflare D1</span>
                        </div>
                    </div>

                    {/* 利用規約・プライバシーポリシーリンク */}
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                        <Link
                            href="/terms"
                            className="flex justify-between items-center py-2 text-white/70 hover:text-white transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <span>📜</span> 利用規約
                            </span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                        <Link
                            href="/privacy"
                            className="flex justify-between items-center py-2 text-white/70 hover:text-white transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <span>🔒</span> プライバシーポリシー
                            </span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </section>

                {/* フィードバック */}
                <section className="glass rounded-2xl p-4 border border-white/5">
                    <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <span>📮</span> フィードバック
                    </h2>
                    <p className="text-white/60 text-sm mb-4">
                        バグや不具合を見つけたら、または新しい機能をご要望の場合は、こちらからお知らせください。
                    </p>
                    <button
                        onClick={() => setIsFeedbackOpen(true)}
                        className="w-full py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        📝 要望・バグを報告する
                    </button>
                </section>

                {/* 危険ゾーン - アカウント削除 */}
                <section className="glass rounded-2xl p-4 border border-red-500/30 bg-red-500/5">
                    <h2 className="text-red-400 font-semibold mb-4 flex items-center gap-2">
                        <span>⚠️</span> 危険ゾーン
                    </h2>
                    <p className="text-white/60 text-sm mb-4">
                        アカウントを削除すると、すべてのデータが完全に削除され、復元できません。
                    </p>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="w-full py-3 bg-red-600/20 border border-red-500/50 text-red-400 rounded-xl hover:bg-red-600/30 transition-colors flex items-center justify-center gap-2 font-semibold"
                    >
                        🗑️ アカウントを削除（退会）
                    </button>
                </section>
            </main>

            {/* アカウント削除確認モーダル */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80">
                    <div className="glass rounded-2xl p-6 max-w-sm w-full border border-red-500/30">
                        <h3 className="text-red-400 font-bold text-lg mb-4 flex items-center gap-2">
                            <span>⚠️</span> アカウント削除
                        </h3>
                        <div className="space-y-4">
                            <p className="text-white/80 text-sm">
                                本当にアカウントを削除しますか？この操作は<span className="text-red-400 font-bold">取り消せません</span>。
                            </p>
                            <p className="text-white/60 text-xs">
                                以下のデータがすべて削除されます：
                            </p>
                            <ul className="text-white/60 text-xs list-disc list-inside space-y-1">
                                <li>パートナーの好み・NGリスト</li>
                                <li>記録した発言集</li>
                                <li>イベント・記念日</li>
                                <li>ミッション進捗</li>
                                <li>設定情報</li>
                            </ul>
                            <div>
                                <label className="block text-white/60 text-xs mb-2">
                                    確認のため「削除する」と入力してください
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    className="w-full bg-white/5 border border-red-500/30 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-red-500"
                                    placeholder="削除する"
                                />
                            </div>
                            {deleteError && (
                                <p className="text-red-400 text-sm">{deleteError}</p>
                            )}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteConfirmText("");
                                        setDeleteError("");
                                    }}
                                    className="flex-1 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                                    disabled={isDeleting}
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting || deleteConfirmText !== "削除する"}
                                    className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDeleting ? "削除中..." : "削除する"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ボトムナビゲーション */}
            <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/5">
                <div className="max-w-lg mx-auto px-4">
                    <div className="flex items-center justify-around py-3">
                        <NavItem href="/" icon="/nav-home.png" label="ホーム" />
                        <NavItem href="/records" icon="/nav-records.png" label="記録" />
                        <NavItem href="/diary" icon="📔" label="日記" />
                        <NavItem href="/mine-checker" icon="/nav-danger.png" label="地雷" />
                        <NavItem href="/master" icon="/nav-master.png" label="マスター" />
                        <NavItem href="/settings" icon="/nav-settings.png" label="設定" active />
                    </div>
                </div>
            </nav>

            <FeedbackModal
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
            />
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

