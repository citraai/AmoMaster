"use client";

import { useEffect, useState } from "react";
import * as dataService from "@/lib/data-service";

interface StatsCardProps {
    icon: string;
    label: string;
    value: string | number;
    subtext?: string;
    isSpecial?: boolean;
}

export default function StatsCard({ icon, label, value, subtext, isSpecial = false }: StatsCardProps) {
    return (
        <div className={`
            stats-card
            ${isSpecial ? "stats-card-special" : ""}
            flex flex-col items-center justify-center text-center
            min-h-[100px]
        `}>
            <span className="text-2xl mb-2">{icon}</span>
            <span className="stat-number text-white mb-1">{value}</span>
            <span className="stat-label">{label}</span>
            {subtext && (
                <span className="text-[10px] text-white/40 mt-1">{subtext}</span>
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

                // 日記データも取得
                let diaries: { createdAt: string }[] = [];
                try {
                    const diaryRes = await fetch("/api/diary");
                    if (diaryRes.ok) {
                        diaries = await diaryRes.json();
                    }
                } catch {
                    // 日記取得エラーは無視
                }

                // 今月の記録数を計算（日記も含む）
                const now = new Date();
                const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

                const allRecords = [...prefs, ...quotes, ...diaries];
                const monthlyRecords = allRecords.filter((r: { createdAt: string }) =>
                    r.createdAt.startsWith(thisMonth)
                );
                setMonthlyCount(monthlyRecords.length);

                // 連続日数を計算（日記も含む）
                const today = now.toISOString().split("T")[0];
                const hasRecordToday = allRecords.some((r: { createdAt: string }) =>
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
            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="stats-card animate-pulse min-h-[100px]">
                        <div className="h-6 bg-white/10 rounded-lg mb-2 w-8 mx-auto"></div>
                        <div className="h-8 bg-white/10 rounded-lg w-12 mx-auto"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-4">
            <StatsCard
                icon="📝"
                label="今月の記録"
                value={monthlyCount}
            />
            <StatsCard
                icon="🔥"
                label="連続日数"
                value={consecutiveDays}
                subtext="日"
            />
            <StatsCard
                icon="💕"
                label="理解度"
                value={monthlyCount >= 5 ? "良好" : "---"}
                isSpecial={monthlyCount >= 5}
            />
        </div>
    );
}
