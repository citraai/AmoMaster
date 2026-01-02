"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// 感情の選択肢
const MOODS = [
    { value: "happy", label: "😊 嬉しい", color: "bg-yellow-500/20 text-yellow-400" },
    { value: "peaceful", label: "😌 穏やか", color: "bg-green-500/20 text-green-400" },
    { value: "excited", label: "🤩 ワクワク", color: "bg-pink-500/20 text-pink-400" },
    { value: "tired", label: "😴 疲れた", color: "bg-blue-500/20 text-blue-400" },
    { value: "sad", label: "😢 悲しい", color: "bg-indigo-500/20 text-indigo-400" },
    { value: "anxious", label: "😰 不安", color: "bg-purple-500/20 text-purple-400" },
    { value: "angry", label: "😠 怒り", color: "bg-red-500/20 text-red-400" },
    { value: "neutral", label: "😐 普通", color: "bg-gray-500/20 text-gray-400" },
];

interface DiaryEntry {
    id: string;
    content: string;
    mood: string | null;
    aiInsight: string | null;
    createdAt: string;
}

export default function DiaryPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isWriting, setIsWriting] = useState(false);
    const [content, setContent] = useState("");
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generateAI, setGenerateAI] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    const loadEntries = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/diary");
            if (response.ok) {
                const data = await response.json();
                setEntries(data.data || []);
            }
        } catch (error) {
            console.error("日記の読み込みエラー:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (status === "authenticated") {
            loadEntries();
        }
    }, [status]);

    const handleSubmit = async () => {
        if (!content.trim()) return;

        try {
            setIsSubmitting(true);
            const response = await fetch("/api/diary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: content.trim(),
                    mood: selectedMood,
                    generateInsight: generateAI,
                }),
            });

            if (response.ok) {
                setContent("");
                setSelectedMood(null);
                setIsWriting(false);
                loadEntries();
            }
        } catch (error) {
            console.error("日記の保存エラー:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("この日記を削除しますか？")) return;

        try {
            const response = await fetch(`/api/diary?id=${id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                loadEntries();
            }
        } catch (error) {
            console.error("日記の削除エラー:", error);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "short",
        });
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getMoodInfo = (mood: string | null) => {
        return MOODS.find(m => m.value === mood) || null;
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen hero-pattern flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="text-4xl mb-4 animate-pulse">📔</div>
                    <p>読み込み中...</p>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return null;
    }

    return (
        <div className="min-h-screen hero-pattern pb-24">
            {/* ヘッダー */}
            <header className="sticky top-0 z-50 glass border-b border-white/5">
                <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
                    <Link href="/" className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-white font-bold text-lg">日記</h1>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
                {/* 日記を書くボタン */}
                {!isWriting && (
                    <button
                        onClick={() => setIsWriting(true)}
                        className="w-full card-dark p-4 text-left hover:bg-white/10 transition-colors border border-white/10"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                                <span className="text-xl">✏️</span>
                            </div>
                            <div>
                                <p className="text-white font-medium">今日の日記を書く</p>
                                <p className="text-white/50 text-sm">パートナーとの思い出を記録しよう</p>
                            </div>
                        </div>
                    </button>
                )}

                {/* 日記入力フォーム */}
                {isWriting && (
                    <div className="card-dark p-4 space-y-4 border border-pink-500/30">
                        {/* 感情選択 */}
                        <div>
                            <p className="text-white/60 text-sm mb-2">今日の気分は？</p>
                            <div className="flex flex-wrap gap-2">
                                {MOODS.map((mood) => (
                                    <button
                                        key={mood.value}
                                        onClick={() => setSelectedMood(selectedMood === mood.value ? null : mood.value)}
                                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${selectedMood === mood.value
                                                ? mood.color + " ring-2 ring-white/30"
                                                : "bg-white/5 text-white/60 hover:bg-white/10"
                                            }`}
                                    >
                                        {mood.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* テキスト入力 */}
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="今日あったこと、感じたことを書いてみよう..."
                            className="w-full h-40 bg-white/5 rounded-xl p-4 text-white placeholder-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                        />

                        {/* AI分析オプション */}
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={generateAI}
                                onChange={(e) => setGenerateAI(e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${generateAI ? "bg-pink-500" : "bg-white/10"
                                }`}>
                                {generateAI && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-white/60 text-sm">AIからのアドバイスをもらう</span>
                        </label>

                        {/* ボタン */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setIsWriting(false);
                                    setContent("");
                                    setSelectedMood(null);
                                }}
                                className="flex-1 py-3 rounded-xl bg-white/10 text-white/60 hover:bg-white/15 transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!content.trim() || isSubmitting}
                                className="flex-1 py-3 rounded-xl bg-pink-600 text-white font-medium hover:bg-pink-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "保存中..." : "保存する"}
                            </button>
                        </div>
                    </div>
                )}

                {/* 日記一覧 */}
                {entries.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-3">📔</div>
                        <p className="text-white/40">まだ日記がありません</p>
                        <p className="text-white/30 text-sm">最初の一歩を踏み出そう</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {entries.map((entry) => {
                            const moodInfo = getMoodInfo(entry.mood);
                            return (
                                <div key={entry.id} className="card-dark p-4 border border-white/10">
                                    {/* ヘッダー */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white/40 text-sm">{formatDate(entry.createdAt)}</span>
                                            <span className="text-white/20 text-xs">{formatTime(entry.createdAt)}</span>
                                        </div>
                                        {moodInfo && (
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${moodInfo.color}`}>
                                                {moodInfo.label}
                                            </span>
                                        )}
                                    </div>

                                    {/* 本文 */}
                                    <p className="text-white whitespace-pre-wrap mb-3">{entry.content}</p>

                                    {/* AIインサイト */}
                                    {entry.aiInsight && (
                                        <div className="bg-pink-500/10 rounded-xl p-3 border border-pink-500/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-pink-400 text-sm font-medium">💬 恋愛マスターより</span>
                                            </div>
                                            <p className="text-white/80 text-sm">{entry.aiInsight}</p>
                                        </div>
                                    )}

                                    {/* 削除ボタン */}
                                    <div className="flex justify-end mt-3">
                                        <button
                                            onClick={() => handleDelete(entry.id)}
                                            className="text-white/30 hover:text-red-400 text-xs transition-colors"
                                        >
                                            削除
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* ナビゲーション */}
            <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/5">
                <div className="max-w-lg mx-auto px-4 py-2 flex justify-around">
                    <NavItem href="/" icon="/nav-home.png" label="ホーム" />
                    <NavItem href="/records" icon="/nav-records.png" label="記録" />
                    <NavItem href="/diary" icon="/nav-missions.png" label="日記" active />
                    <NavItem href="/mine-checker" icon="/nav-danger.png" label="地雷" />
                    <NavItem href="/master" icon="/nav-master.png" label="マスター" />
                    <NavItem href="/settings" icon="/nav-settings.png" label="設定" />
                </div>
            </nav>
        </div>
    );
}

function NavItem({ href, icon, label, active }: { href: string; icon: string; label: string; active?: boolean }) {
    const isImage = icon.startsWith('/');
    return (
        <Link
            href={href}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${active ? "nav-item-active" : "opacity-60 hover:opacity-100"
                }`}
        >
            {isImage ? (
                <img src={icon} alt={label} className={`w-8 h-8 rounded-full object-cover ${active ? "scale-110" : ""} transition-transform`} />
            ) : (
                <span className="text-lg">{icon}</span>
            )}
            <span className="text-[10px]">{label}</span>
        </Link>
    );
}
