"use client";

import { useState } from "react";

interface QuickLogButtonProps {
    icon: React.ReactNode;
    label: string;
    color: string;
    onClick?: () => void;
}

export default function QuickLogButton({ icon, label, color, onClick }: QuickLogButtonProps) {
    const [isPressed, setIsPressed] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);

    const handleClick = () => {
        setIsPressed(true);
        setShowFeedback(true);

        setTimeout(() => setIsPressed(false), 150);
        setTimeout(() => setShowFeedback(false), 1500);

        onClick?.();
    };

    return (
        <button
            onClick={handleClick}
            className={`
        relative flex flex-col items-center justify-center
        w-full aspect-square rounded-2xl
        bg-gradient-to-br ${color}
        border border-white/10
        transition-all duration-200
        hover:scale-105 hover:shadow-lg hover:shadow-white/5
        active:scale-95
        ${isPressed ? "scale-95" : ""}
      `}
        >
            {/* アイコン */}
            <span className="text-3xl mb-2">{icon}</span>

            {/* ラベル */}
            <span className="text-white/90 text-xs font-medium">{label}</span>

            {/* 押した時のフィードバック */}
            {showFeedback && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/20 animate-pulse">
                    <span className="text-white text-2xl">✓</span>
                </div>
            )}

            {/* グロー効果 */}
            <div
                className={`
          absolute inset-0 -z-10 rounded-2xl blur-xl
          bg-gradient-to-br ${color} opacity-50
          transition-opacity duration-300
        `}
            />
        </button>
    );
}

interface QuickLogGridProps {
    onLogClick?: (type: string) => void;
}

export function QuickLogGrid({ onLogClick }: QuickLogGridProps) {
    const buttons = [
        { icon: "❤️", label: "好きなもの", color: "from-pink-500/40 to-rose-600/40", type: "like" },
        { icon: "💬", label: "言霊ログ", color: "from-blue-500/40 to-indigo-600/40", type: "quote" },
        { icon: "🎁", label: "プレゼント", color: "from-purple-500/40 to-violet-600/40", type: "gift" },
        { icon: "📍", label: "行きたい場所", color: "from-green-500/40 to-emerald-600/40", type: "place" },
        { icon: "🍽️", label: "食べたいもの", color: "from-orange-500/40 to-amber-600/40", type: "food" },
        { icon: "⚠️", label: "NG/地雷", color: "from-red-500/40 to-red-700/40", type: "ng" },
    ];

    const handleButtonClick = (type: string) => {
        onLogClick?.(type);
    };

    return (
        <div className="grid grid-cols-3 gap-3">
            {buttons.map((btn) => (
                <QuickLogButton
                    key={btn.type}
                    icon={btn.icon}
                    label={btn.label}
                    color={btn.color}
                    onClick={() => handleButtonClick(btn.type)}
                />
            ))}
        </div>
    );
}
