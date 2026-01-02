"use client";

import { useState } from "react";
import Link from "next/link";
import { checkMineAsync, getRiskColor, getRiskLabel, type MineCheckResult } from "@/lib/ai/mine-checker";
import QuickLogModal from "@/components/QuickLogModal";

export default function MineCheckerPage() {
    const [input, setInput] = useState("");
    const [result, setResult] = useState<MineCheckResult | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCheck = async () => {
        if (!input.trim()) return;

        setIsChecking(true);

        try {
            const checkResult = await checkMineAsync(input);
            setResult(checkResult);
        } catch (error) {
            console.error("地雷チェックエラー:", error);
        } finally {
            setIsChecking(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleCheck();
        }
    };

    const getRiskBgColor = (level: MineCheckResult["riskLevel"]) => {
        switch (level) {
            case "danger": return "bg-red-500/20 border-red-500/50";
            case "warning": return "bg-yellow-500/20 border-yellow-500/50";
            case "safe": return "bg-green-500/20 border-green-500/50";
        }
    };

    const getRiskEmoji = (level: MineCheckResult["riskLevel"]) => {
        switch (level) {
            case "danger": return "💥";
            case "warning": return "⚠️";
            case "safe": return "✅";
        }
    };

    return (
        <div className="min-h-screen hero-pattern">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-white/5">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Link href="/" className="text-white/60 hover:text-white transition-colors">
                        <span className="text-xl">←</span>
                    </Link>
                    <h1 className="text-white font-bold text-lg flex items-center gap-2">
                        💣 地雷チェッカー
                    </h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* 説明 */}
                <div className="glass rounded-2xl p-4 border border-white/5">
                    <p className="text-white/70 text-sm">
                        プレゼントや発言を入力すると、過去のNG記録と照合してリスクを判定します。
                        パートナーを傷つける前にチェック！
                    </p>
                </div>

                {/* 入力エリア */}
                <div className="glass rounded-2xl p-4 border border-white/5">
                    <label className="text-white/60 text-sm mb-2 block">
                        チェックしたい内容
                    </label>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="例: 香水をプレゼントしようと思ってる"
                        className="w-full bg-white/5 text-white rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500/50 min-h-[100px]"
                    />
                    <button
                        onClick={handleCheck}
                        disabled={!input.trim() || isChecking}
                        className="mt-3 w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        {isChecking ? (
                            <>
                                <span className="animate-spin">🔍</span>
                                チェック中...
                            </>
                        ) : (
                            <>
                                🔍 地雷チェック
                            </>
                        )}
                    </button>
                </div>

                {/* 結果表示 */}
                {result && (
                    <div className={`glass rounded-2xl p-4 border ${getRiskBgColor(result.riskLevel)}`}>
                        {/* スコア表示 */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="text-4xl">{getRiskEmoji(result.riskLevel)}</span>
                                <div>
                                    <div className={`text-2xl font-bold ${getRiskColor(result.riskLevel)}`}>
                                        {getRiskLabel(result.riskLevel)}
                                    </div>
                                    <div className="text-white/60 text-sm">
                                        リスクスコア: {result.riskScore}/100
                                    </div>
                                </div>
                            </div>
                            {/* スコアバー */}
                            <div className="w-24 h-24 relative">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.1)"
                                        strokeWidth="8"
                                    />
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        fill="none"
                                        stroke={result.riskLevel === "danger" ? "#ef4444" : result.riskLevel === "warning" ? "#eab308" : "#22c55e"}
                                        strokeWidth="8"
                                        strokeDasharray={`${result.riskScore * 2.51} 251`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">{result.riskScore}</span>
                                </div>
                            </div>
                        </div>

                        {/* アドバイス */}
                        <div className="bg-black/20 rounded-xl p-3 mb-4">
                            <p className="text-white text-sm">{result.advice}</p>
                        </div>

                        {/* マッチしたNG */}
                        {result.matchedNGs.length > 0 && (
                            <div>
                                <h3 className="text-white/60 text-sm mb-2">⚡ 関連するNG記録:</h3>
                                <div className="space-y-2">
                                    {result.matchedNGs.map((ng, index) => (
                                        <div key={index} className="bg-black/20 rounded-lg px-3 py-2 flex items-center gap-2">
                                            <span className="text-red-400">✕</span>
                                            <span className="text-white/80 text-sm flex-1">{ng.content}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded ${ng.matchType === "exact" ? "bg-red-500/30 text-red-400" :
                                                ng.matchType === "partial" ? "bg-yellow-500/30 text-yellow-400" :
                                                    "bg-white/10 text-white/60"
                                                }`}>
                                                {ng.matchType === "exact" ? "完全一致" :
                                                    ng.matchType === "partial" ? "部分一致" : "類似"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* NG記録がない場合のヒント */}
                        {result.matchedNGs.length === 0 && result.riskLevel === "safe" && (
                            <div className="text-white/40 text-sm text-center">
                                💡 NG記録を増やすと、より正確なチェックができます
                            </div>
                        )}
                    </div>
                )}

                {/* NG記録を追加するボタン */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="block w-full glass rounded-2xl p-4 border border-white/5 hover:bg-white/5 transition-colors text-left"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-white font-medium">📝 NG記録を追加</div>
                            <div className="text-white/40 text-sm">より精度の高いチェックのために</div>
                        </div>
                        <span className="text-white/40">+</span>
                    </div>
                </button>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/5">
                <div className="max-w-2xl mx-auto px-4 py-3 flex justify-around">
                    <Link href="/" className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-colors">
                        <img src="/nav-home.png" alt="ホーム" className="w-8 h-8 rounded-full object-cover" />
                        <span className="text-xs">ホーム</span>
                    </Link>
                    <Link href="/records" className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-colors">
                        <img src="/nav-records.png" alt="記録" className="w-8 h-8 rounded-full object-cover" />
                        <span className="text-xs">記録</span>
                    </Link>
                    <Link href="/diary" className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-colors">
                        <img src="/nav-missions.png" alt="日記" className="w-8 h-8 rounded-full object-cover" />
                        <span className="text-xs">日記</span>
                    </Link>
                    <Link href="/mine-checker" className="flex flex-col items-center gap-1 nav-item-active">
                        <img src="/nav-danger.png" alt="地雷" className="w-8 h-8 rounded-full object-cover scale-110" />
                        <span className="text-xs">地雷</span>
                    </Link>
                    <Link href="/master" className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-colors">
                        <img src="/nav-master.png" alt="マスター" className="w-8 h-8 rounded-full object-cover" />
                        <span className="text-xs">マスター</span>
                    </Link>
                    <Link href="/settings" className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-colors">
                        <img src="/nav-settings.png" alt="設定" className="w-8 h-8 rounded-full object-cover" />
                        <span className="text-xs">設定</span>
                    </Link>
                </div>
            </nav>

            {/* NG追加モーダル */}
            <QuickLogModal
                isOpen={isModalOpen}
                category="ng"
                onClose={() => setIsModalOpen(false)}
                onSaved={() => setIsModalOpen(false)}
            />
        </div>
    );
}
