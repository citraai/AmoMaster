"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RecordsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
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
            <header className="pt-6 pb-2">
                <h1 className="text-center text-white font-bold text-xl tracking-wide">AmoMaster</h1>
            </header>

            {/* メインコンテンツ */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
                {/* キャラクターセクション */}
                <div className={`flex items-end justify-center gap-0 mb-4 transition-all duration-700 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
                    {/* 魔法使いキャラ */}
                    <img src="/char-wizard.png" alt="魔法使い" className="w-48 h-48 object-contain" />

                    {/* 吹き出し */}
                    <div className={`relative bg-white/90 rounded-2xl px-4 py-3 shadow-lg -ml-10 -mr-10 mb-16 transition-all duration-700 delay-200 ${isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
                        <p className="text-gray-700 text-sm text-center font-medium leading-relaxed">
                            今日はどんな<br />素敵なことが<br />あったの？
                        </p>
                    </div>

                    {/* 妖精キャラ */}
                    <img src="/char-fairy.png" alt="妖精" className="w-48 h-48 object-contain" />
                </div>

                {/* ボタンセクション */}
                <div className="w-full max-w-sm space-y-4">
                    {/* 日記ボタン */}
                    <Link
                        href="/diary"
                        className={`block w-full transition-all duration-500 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                        style={{ transitionDelay: "300ms" }}
                    >
                        <div className="relative overflow-hidden rounded-[28px] p-5 bg-gradient-to-br from-pink-100 to-pink-50 border border-pink-200/50 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                            {/* 3D効果の光沢 */}
                            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/60 to-transparent rounded-t-[28px]" />

                            <div className="relative flex items-center justify-center gap-3">
                                <span className="text-3xl">📓</span>
                                <span className="text-2xl font-bold text-pink-800/80">日記</span>
                            </div>
                        </div>
                    </Link>

                    {/* 爆速記録ボタン */}
                    <Link
                        href="/records/quick"
                        className={`block w-full transition-all duration-500 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                        style={{ transitionDelay: "400ms" }}
                    >
                        <div className="relative overflow-hidden rounded-[28px] p-5 bg-gradient-to-br from-amber-100 to-yellow-50 border border-yellow-200/50 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                            {/* 3D効果の光沢 */}
                            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/60 to-transparent rounded-t-[28px]" />

                            <div className="relative flex items-center justify-center gap-3">
                                <span className="text-3xl">⚡</span>
                                <span className="text-2xl font-bold text-amber-800/80">爆速記録</span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* 装飾のハートと星 */}
                <div className={`absolute top-16 left-6 text-pink-400/50 text-xl transition-all duration-1000 ${isAnimating ? "opacity-100" : "opacity-0"}`}>♥</div>
                <div className={`absolute top-24 right-8 text-yellow-400/40 text-lg transition-all duration-1000 delay-100 ${isAnimating ? "opacity-100" : "opacity-0"}`}>✦</div>
                <div className={`absolute top-40 left-12 text-purple-400/40 text-sm transition-all duration-1000 delay-200 ${isAnimating ? "opacity-100" : "opacity-0"}`}>✦</div>
                <div className={`absolute top-28 right-20 text-pink-300/40 text-xs transition-all duration-1000 delay-300 ${isAnimating ? "opacity-100" : "opacity-0"}`}>♥</div>
                <div className={`absolute top-48 right-6 text-rose-400/40 text-sm transition-all duration-1000 delay-400 ${isAnimating ? "opacity-100" : "opacity-0"}`}>♥</div>
                <div className={`absolute bottom-36 left-8 text-pink-400/50 text-lg transition-all duration-1000 delay-500 ${isAnimating ? "opacity-100" : "opacity-0"}`}>✦</div>
                <div className={`absolute bottom-44 right-10 text-yellow-300/50 text-xl transition-all duration-1000 delay-600 ${isAnimating ? "opacity-100" : "opacity-0"}`}>♥</div>
                <div className={`absolute bottom-52 left-16 text-purple-300/40 text-xs transition-all duration-1000 delay-700 ${isAnimating ? "opacity-100" : "opacity-0"}`}>✦</div>
                <div className={`absolute bottom-32 right-20 text-pink-300/40 text-sm transition-all duration-1000 delay-800 ${isAnimating ? "opacity-100" : "opacity-0"}`}>✦</div>
                <div className={`absolute top-60 left-4 text-rose-300/30 text-xs transition-all duration-1000 delay-900 ${isAnimating ? "opacity-100" : "opacity-0"}`}>♥</div>
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
