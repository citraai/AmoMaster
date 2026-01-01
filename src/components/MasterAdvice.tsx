"use client";

import { useState, useEffect } from "react";
import { DAILY_KATSU_MESSAGES } from "@/lib/ai/prompts";

interface MasterAdviceProps {
    className?: string;
}

export default function MasterAdvice({ className = "" }: MasterAdviceProps) {
    const [currentMessage, setCurrentMessage] = useState(DAILY_KATSU_MESSAGES[0]);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // ランダムなメッセージを選択
        const randomIndex = Math.floor(Math.random() * DAILY_KATSU_MESSAGES.length);
        setCurrentMessage(DAILY_KATSU_MESSAGES[randomIndex]);
    }, []);

    const refreshMessage = () => {
        setIsAnimating(true);
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * DAILY_KATSU_MESSAGES.length);
            setCurrentMessage(DAILY_KATSU_MESSAGES[randomIndex]);
            setIsAnimating(false);
        }, 300);
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "warning":
                return "from-red-500/20 to-orange-500/20 border-red-500/50";
            case "challenge":
                return "from-purple-500/20 to-pink-500/20 border-purple-500/50";
            case "mission":
                return "from-green-500/20 to-emerald-500/20 border-green-500/50";
            case "motivation":
                return "from-blue-500/20 to-cyan-500/20 border-blue-500/50";
            default:
                return "from-amber-500/20 to-yellow-500/20 border-amber-500/50";
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "warning": return "⚠️ 警告";
            case "challenge": return "🔥 挑戦";
            case "mission": return "🎯 ミッション";
            case "motivation": return "💪 激励";
            case "reflection": return "🪞 振り返り";
            case "action": return "⚡ アクション";
            default: return "📢 メッセージ";
        }
    };

    return (
        <div className={`relative ${className}`}>
            {/* 背景のグロー効果 */}
            <div className="absolute inset-0 -z-10 blur-3xl opacity-30">
                <div className={`w-full h-full bg-gradient-to-br ${getTypeColor(currentMessage.type)}`} />
            </div>

            {/* メインカード */}
            <div
                className={`
          relative overflow-hidden rounded-2xl
          bg-gradient-to-br ${getTypeColor(currentMessage.type)}
          border backdrop-blur-xl
          transition-all duration-300
          ${isAnimating ? "scale-95 opacity-50" : "scale-100 opacity-100"}
        `}
            >
                {/* ヘッダー */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg ring-2 ring-white/20">
                            <img src="/master-icon.png" alt="恋愛マスター" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm">恋愛マスター</h3>
                            <span className="text-xs text-white/60">{getTypeLabel(currentMessage.type)}</span>
                        </div>
                    </div>
                    <button
                        onClick={refreshMessage}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors active:scale-90"
                        aria-label="新しいメッセージを取得"
                    >
                        <svg
                            className={`w-5 h-5 text-white/70 ${isAnimating ? "animate-spin" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                    </button>
                </div>

                {/* メッセージ本文 */}
                <div className="px-5 pb-6">
                    <p className="text-white text-lg md:text-xl font-bold leading-relaxed">
                        「{currentMessage.message}」
                    </p>
                </div>

                {/* デコレーション */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10">
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
                        <text x="50" y="70" fontSize="60" textAnchor="middle">喝</text>
                    </svg>
                </div>
            </div>
        </div>
    );
}
