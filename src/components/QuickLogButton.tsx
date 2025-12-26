"use client";

import { useState } from "react";

interface QuickLogButtonProps {
    icon: string;
    label: string;
    colorClass: string;
    onClick?: () => void;
}

export default function QuickLogButton({ icon, label, colorClass, onClick }: QuickLogButtonProps) {
    const [isPressed, setIsPressed] = useState(false);

    const handleClick = () => {
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 200);
        onClick?.();
    };

    return (
        <button
            onClick={handleClick}
            className={`
                relative flex flex-col items-center justify-center
                w-full py-4 rounded-2xl
                ${colorClass}
                border border-white/10
                transition-all duration-300 ease-out
                hover:scale-[1.02] hover:-translate-y-1
                active:scale-[0.98]
                ${isPressed ? "scale-[0.98]" : ""}
            `}
        >
            <span className="text-2xl mb-1">{icon}</span>
            <span className="text-white text-xs font-medium">{label}</span>
        </button>
    );
}

interface QuickLogGridProps {
    onLogClick?: (type: string) => void;
}

export function QuickLogGrid({ onLogClick }: QuickLogGridProps) {
    const buttons = [
        {
            icon: "❤️",
            label: "好きなもの",
            colorClass: "quick-action-pink",
            type: "like"
        },
        {
            icon: "💬",
            label: "言霊ログ",
            colorClass: "quick-action-blue",
            type: "quote"
        },
        {
            icon: "🎁",
            label: "プレゼント",
            colorClass: "quick-action-purple",
            type: "gift"
        },
        {
            icon: "📍",
            label: "行きたい場所",
            colorClass: "bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-500/30 hover:border-green-500/50",
            type: "place"
        },
        {
            icon: "🍽️",
            label: "食べたいもの",
            colorClass: "bg-gradient-to-br from-orange-500/20 to-amber-600/20 border-orange-500/30 hover:border-orange-500/50",
            type: "food"
        },
        {
            icon: "⚠️",
            label: "NG/地雷",
            colorClass: "bg-gradient-to-br from-red-500/20 to-red-700/20 border-red-500/30 hover:border-red-500/50",
            type: "ng"
        },
    ];

    return (
        <div className="grid grid-cols-3 gap-3">
            {buttons.map((btn) => (
                <QuickLogButton
                    key={btn.type}
                    icon={btn.icon}
                    label={btn.label}
                    colorClass={btn.colorClass}
                    onClick={() => onLogClick?.(btn.type)}
                />
            ))}
        </div>
    );
}
