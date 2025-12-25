"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    getTodayMissions,
    getUserProgress,
    completeMission,
    getCurrentLevel,
    getProgressToNextLevel,
    checkAndCompleteRecordMissions,
    Mission,
    UserProgress,
    Level,
    LEVELS,
} from "@/lib/missions";

export default function MissionsPage() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [progress, setProgress] = useState<UserProgress | null>(null);
    const [currentLevel, setCurrentLevel] = useState<Level>(LEVELS[0]);
    const [levelProgress, setLevelProgress] = useState(0);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [newLevelTitle, setNewLevelTitle] = useState("");

    const loadData = () => {
        const todayMissions = getTodayMissions();
        const userProgress = getUserProgress();
        const level = getCurrentLevel(userProgress.xp);
        const progressPercent = getProgressToNextLevel(userProgress.xp);

        setMissions(todayMissions);
        setProgress(userProgress);
        setCurrentLevel(level);
        setLevelProgress(progressPercent);
    };

    useEffect(() => {
        // 記録系ミッションを自動チェック
        checkAndCompleteRecordMissions();
        loadData();
    }, []);

    const handleComplete = (missionId: string) => {
        const result = completeMission(missionId);

        if (result.levelUp) {
            setNewLevelTitle(result.newLevel.title);
            setShowLevelUp(true);
            setTimeout(() => setShowLevelUp(false), 3000);
        }

        loadData();
    };

    const isCompleted = (missionId: string) => {
        return progress?.completedMissions.includes(missionId) || false;
    };

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
                    <h1 className="text-white font-bold text-lg">デイリーミッション</h1>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
                {/* レベル表示 */}
                <div className="card-dark p-6 text-center">
                    <div className="text-4xl mb-2">🎖️</div>
                    <div className="text-white/60 text-sm">Lv.{currentLevel.level}</div>
                    <div className="text-white text-2xl font-bold mb-4">{currentLevel.title}</div>

                    {/* XPバー */}
                    <div className="mb-2">
                        <div className="flex justify-between text-xs text-white/40 mb-1">
                            <span>{progress?.xp || 0} XP</span>
                            <span>{currentLevel.level < LEVELS.length ? LEVELS[currentLevel.level].requiredXp + " XP" : "MAX"}</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-pink-500 to-red-500 transition-all duration-500"
                                style={{ width: `${levelProgress}%` }}
                            />
                        </div>
                    </div>
                    <div className="text-white/40 text-xs">
                        累計達成: {progress?.totalCompleted || 0} ミッション
                    </div>
                </div>

                {/* 今日のミッション */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-white/60 text-sm font-medium">今日のミッション</h2>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                            {progress?.completedMissions.length || 0} / {missions.length} 達成
                        </span>
                    </div>
                    <div className="space-y-3">
                        {missions.map((mission) => (
                            <div
                                key={mission.id}
                                className={`card-dark p-4 transition-all relative ${isCompleted(mission.id)
                                    ? "border-2 border-green-500/50 bg-green-500/5"
                                    : "border border-white/10"
                                    }`}
                            >
                                {/* 達成マーク */}
                                {isCompleted(mission.id) && (
                                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm">✓</span>
                                    </div>
                                )}
                                <div className="flex items-start gap-3">
                                    <div className="text-2xl">{mission.icon}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`font-medium ${isCompleted(mission.id) ? "text-green-400 line-through" : "text-white"}`}>
                                                {mission.title}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400">
                                                +{mission.xp} XP
                                            </span>
                                        </div>
                                        <p className="text-white/50 text-sm">{mission.description}</p>
                                    </div>
                                    {!isCompleted(mission.id) && (
                                        mission.type === "record" ? (
                                            <Link
                                                href="/"
                                                className="px-3 py-2 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-500 transition-all"
                                            >
                                                記録へ
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={() => handleComplete(mission.id)}
                                                className="px-4 py-2 rounded-lg text-sm font-medium bg-pink-600 text-white hover:bg-pink-500 transition-all"
                                            >
                                                達成！
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ヒント */}
                <div className="text-center text-white/30 text-xs">
                    ミッションは毎日リセットされます
                </div>
            </main>

            {/* レベルアップモーダル */}
            {showLevelUp && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="text-center animate-bounce">
                        <div className="text-6xl mb-4">🎉</div>
                        <div className="text-white text-2xl font-bold mb-2">レベルアップ！</div>
                        <div className="text-pink-400 text-xl">{newLevelTitle}</div>
                    </div>
                </div>
            )}

            {/* ナビゲーション */}
            <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/5">
                <div className="max-w-lg mx-auto px-4 py-2 flex justify-around">
                    <NavItem href="/" icon="🏠" label="ホーム" />
                    <NavItem href="/records" icon="📚" label="記録" />
                    <NavItem href="/missions" icon="🎯" label="ミッション" active />
                    <NavItem href="/mine-checker" icon="💣" label="地雷" />
                    <NavItem href="/master" icon="🧠" label="マスター" />
                    <NavItem href="/settings" icon="⚙️" label="設定" />
                </div>
            </nav>
        </div>
    );
}

function NavItem({ href, icon, label, active }: { href: string; icon: string; label: string; active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${active ? "text-white" : "text-white/40 hover:text-white/60"
                }`}
        >
            <span className="text-lg">{icon}</span>
            <span className="text-[10px]">{label}</span>
        </Link>
    );
}
