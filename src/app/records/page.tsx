"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RecordsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [showSelection, setShowSelection] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        // ページ読み込み時にアニメーション開始
        setTimeout(() => setIsAnimating(true), 100);
    }, []);

    if (status === "loading") {
        return (
            <div className="min-h-screen hero-pattern flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="text-4xl mb-4 animate-pulse">📖</div>
                    <p>読み込み中...</p>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") return null;

    return (
        <div className="min-h-screen hero-pattern flex flex-col">
            {/* ヘッダー */}
            <header className="sticky top-0 z-50 glass border-b border-white/5">
                <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
                    <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors">
                        <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-white font-bold text-lg">📖 記録</h1>
                </div>
            </header>

            {/* 選択画面 */}
            <main className="flex-1 flex items-center justify-center px-6">
                <div className="w-full max-w-sm">
                    {/* 本のアニメーション */}
                    <div className={`text-center mb-8 transition-all duration-700 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"}`}>
                        <div className="text-6xl mb-4 animate-bounce-slow">📖</div>
                        <h2 className="text-white text-xl font-bold mb-2">どちらを見る？</h2>
                        <p className="text-white/50 text-sm">パートナーとの大切な記録</p>
                    </div>

                    {/* カード選択 */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* 日記カード */}
                        <Link
                            href="/diary"
                            className={`group relative overflow-hidden rounded-2xl p-6 border border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/20 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                            style={{ transitionDelay: "200ms" }}
                        >
                            <div className="relative z-10">
                                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📔</div>
                                <h3 className="text-white font-bold text-lg mb-1">日記</h3>
                                <p className="text-white/50 text-xs">毎日の思い出</p>
                            </div>
                            {/* 装飾 */}
                            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-pink-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                        </Link>

                        {/* 爆速記録カード */}
                        <Link
                            href="/records/quick"
                            className={`group relative overflow-hidden rounded-2xl p-6 border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20 transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/20 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                            style={{ transitionDelay: "300ms" }}
                        >
                            <div className="relative z-10">
                                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">⚡</div>
                                <h3 className="text-white font-bold text-lg mb-1">爆速記録</h3>
                                <p className="text-white/50 text-xs">好き・ギフト等</p>
                            </div>
                            {/* 装飾 */}
                            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-yellow-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                        </Link>
                    </div>

                    {/* ヒント */}
                    <p className={`text-center text-white/30 text-xs mt-8 transition-all duration-700 ${isAnimating ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "500ms" }}>
                        タップして記録を見返そう
                    </p>
                </div>
            </main>

            {/* ボトムナビゲーション */}
            <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/5">
                <div className="max-w-lg mx-auto px-4">
                    <div className="flex items-center justify-around py-3">
                        <NavItem href="/" icon="/nav-home.png" label="ホーム" />
                        <NavItem href="/records" icon="/nav-records.png" label="記録" active />
                        <NavItem href="/mine-checker" icon="/nav-danger.png" label="地雷" />
                        <NavItem href="/master" icon="/nav-master.png" label="マスター" />
                        <NavItem href="/settings" icon="/nav-settings.png" label="設定" />
                    </div>
                </div>
            </nav>
        </div>
    );
}

function NavItem({
    href,
    icon,
    label,
    active = false,
}: {
    href: string;
    icon: string;
    label: string;
    active?: boolean;
}) {
    const isImage = icon.startsWith('/');
    return (
        <Link
            href={href}
            className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${active ? "nav-item-active" : "opacity-60 hover:opacity-100"
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
