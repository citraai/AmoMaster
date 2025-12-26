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
                w-full py-5 rounded-2xl
                ${colorClass}
                transition-all duration-300 ease-out
                hover:scale-[1.02] hover:-translate-y-1
                active:scale-[0.98]
                ${isPressed ? "scale-[0.98]" : ""}
            `}
        >
            <span className="text-3xl mb-2">{icon}</span>
            <span className="text-white text-sm font-medium">{label}</span>
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
            label: "好き",
            colorClass: "quick-action-pink",
            type: "like"
        },
        {
            icon: "💬",
            label: "名言",
            colorClass: "quick-action-blue",
            type: "quote"
        },
        {
            icon: "📅",
            label: "イベント",
            colorClass: "quick-action-purple",
            type: "event"
        },
    ];

    return (
        <div className="grid grid-cols-3 gap-4">
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
