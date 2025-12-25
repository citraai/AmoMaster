"use client";

import { useEffect, useState } from "react";
import * as dataService from "@/lib/data-service";

interface StatsCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subtext?: string;
    trend?: "up" | "down" | "neutral";
}

export default function StatsCard({ icon, label, value, subtext, trend }: StatsCardProps) {
    const getTrendIcon = () => {
        switch (trend) {
            case "up":
                return <span className="text-green-400">↑</span>;
            case "down":
                return <span className="text-red-400">↓</span>;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{icon}</span>
                <span className="text-white/60 text-xs">{label}</span>
            </div>
            <div className="flex items-end gap-2">
                <span className="text-white text-2xl font-bold">{value}</span>
                {getTrendIcon()}
            </div>
            {subtext && (
                <span className="text-white/40 text-xs">{subtext}</span>
            )}
        </div>
    );
}

export function StatsGrid() {
    const [monthlyCount, setMonthlyCount] = useState(0);
    const [consecutiveDays, setConsecutiveDays] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const [prefs, quotes] = await Promise.all([
                    dataService.getPreferences(),
                    dataService.getQuotes(),
                ]);

                // 今月の記録数を計算
                const now = new Date();
                const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

                const monthlyRecords = [...prefs, ...quotes].filter((r: { createdAt: string }) =>
                    r.createdAt.startsWith(thisMonth)
                );
                setMonthlyCount(monthlyRecords.length);

                // 連続日数を計算（簡易版）
                const today = now.toISOString().split("T")[0];
                const hasRecordToday = [...prefs, ...quotes].some((r: { createdAt: string }) =>
                    r.createdAt.startsWith(today)
                );
                setConsecutiveDays(hasRecordToday ? 1 : 0);

            } catch (error) {
                console.error("統計読み込みエラー:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadStats();
    }, []);

    if (isLoading) {
        return (
            <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 animate-pulse">
                        <div className="h-4 bg-white/10 rounded mb-2"></div>
                        <div className="h-6 bg-white/10 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    const stats = [
        { icon: "📝", label: "記録数", value: monthlyCount, subtext: "今月" },
        { icon: "🔥", label: "連続日数", value: consecutiveDays, subtext: "日" },
        { icon: "💕", label: "パートナー理解度", value: monthlyCount >= 5 ? "良好" : "---", subtext: monthlyCount >= 5 ? "理解が深まっている" : "記録して解放" },
    ];

    return (
        <div className="grid grid-cols-3 gap-3">
            {stats.map((stat, i) => (
                <StatsCard key={i} {...stat} />
            ))}
        </div>
    );
}
