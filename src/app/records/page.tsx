"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Preference, Quote, RecordCategory, CATEGORY_LABELS, CATEGORY_ICONS, formatDate } from "@/lib/types";
import * as dataService from "@/lib/data-service";
import RecordEditModal from "@/components/RecordEditModal";

type FilterCategory = "all" | RecordCategory;

const FILTER_TABS: { key: FilterCategory; label: string; icon: string }[] = [
    { key: "all", label: "すべて", icon: "📋" },
    { key: "like", label: "好き", icon: "❤️" },
    { key: "quote", label: "言葉", icon: "💬" },
    { key: "gift", label: "ギフト", icon: "🎁" },
    { key: "place", label: "場所", icon: "📍" },
    { key: "food", label: "食べ物", icon: "🍽️" },
    { key: "ng", label: "NG", icon: "⚠️" },
];

function isQuote(record: Preference | Quote): record is Quote {
    return "context" in record;
}

export default function RecordsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [records, setRecords] = useState<(Preference | Quote)[]>([]);
    const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month" | "custom">("all");
    const [customDate, setCustomDate] = useState("");
    const [editingRecord, setEditingRecord] = useState<Preference | Quote | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 認証チェック
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    const loadRecords = async () => {
        if (status !== "authenticated") return;

        try {
            setIsLoading(true);
            const [prefs, quotes] = await Promise.all([
                dataService.getPreferences(),
                dataService.getQuotes(),
            ]);

            // 全てのレコードを結合
            const allRecords = [
                ...prefs.map((p: Preference) => ({ ...p, _type: "preference" })),
                ...quotes.map((q: Quote) => ({ ...q, _type: "quote" })),
            ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setRecords(allRecords);
        } catch (error) {
            console.error("記録読み込みエラー:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (status === "authenticated") {
            loadRecords();
        }
    }, [status]);

    // フィルタリング
    const filteredRecords = useMemo(() => {
        let result = records;

        // カテゴリフィルタ
        if (activeFilter !== "all") {
            result = result.filter(r => {
                if (isQuote(r)) return activeFilter === "quote";
                return (r as Preference).category === activeFilter;
            });
        }

        // 検索フィルタ
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(r => r.content.toLowerCase().includes(query));
        }

        // 日付フィルタ
        if (dateFilter !== "all") {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            result = result.filter(r => {
                const recordDate = new Date(r.createdAt);

                if (dateFilter === "today") {
                    return recordDate >= today;
                } else if (dateFilter === "week") {
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return recordDate >= weekAgo;
                } else if (dateFilter === "month") {
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return recordDate >= monthAgo;
                } else if (dateFilter === "custom" && customDate) {
                    const targetDate = new Date(customDate);
                    return recordDate.toDateString() === targetDate.toDateString();
                }
                return true;
            });
        }

        return result;
    }, [records, activeFilter, searchQuery, dateFilter, customDate]);

    const handleRecordSaved = () => {
        loadRecords();
    };

    // ローディング
    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen hero-pattern flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="text-4xl mb-4 animate-pulse">📚</div>
                    <p>読み込み中...</p>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") return null;

    return (
        <div className="min-h-screen hero-pattern">
            {/* ヘッダー */}
            <header className="sticky top-0 z-50 glass border-b border-white/5">
                <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors"
                        >
                            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-white font-bold text-lg">📚 記録一覧</h1>
                            <p className="text-white/40 text-[10px]">パートナーの「好き」を全部覚えてやれ</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* 検索バー */}
            <div className="max-w-lg mx-auto px-4 py-3">
                <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="記録を検索..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-red-500/50"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* 日付フィルター */}
            <div className="max-w-lg mx-auto px-4 pb-2">
                <div className="flex gap-2 items-center">
                    <span className="text-white/40 text-xs">📅</span>
                    <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
                        {[
                            { key: "all", label: "全期間" },
                            { key: "today", label: "今日" },
                            { key: "week", label: "1週間" },
                            { key: "month", label: "1ヶ月" },
                        ].map((option) => (
                            <button
                                key={option.key}
                                onClick={() => {
                                    setDateFilter(option.key as typeof dateFilter);
                                    if (option.key !== "custom") setCustomDate("");
                                }}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${dateFilter === option.key
                                    ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                                    : "bg-white/5 text-white/50 hover:bg-white/10"
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                        <input
                            type="date"
                            value={customDate}
                            onChange={(e) => {
                                setCustomDate(e.target.value);
                                if (e.target.value) setDateFilter("custom");
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all bg-white/5 text-white/50 hover:bg-white/10 ${dateFilter === "custom" ? "border border-purple-500/50" : ""
                                }`}
                        />
                    </div>
                </div>
            </div>

            {/* フィルタータブ */}
            <div className="max-w-lg mx-auto px-4 pb-3">
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                    {FILTER_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveFilter(tab.key)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${activeFilter === tab.key
                                ? "bg-gradient-to-r from-red-500 to-pink-600 text-white"
                                : "bg-white/5 text-white/60 hover:bg-white/10"
                                }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 記録リスト */}
            <main className="max-w-lg mx-auto px-4 pb-24">
                {filteredRecords.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-4xl mb-4">📭</div>
                        <p className="text-white/40 text-sm mb-2">
                            {searchQuery ? "検索結果が見つからない" : "まだ記録がない"}
                        </p>
                        <p className="text-white/20 text-xs">
                            {searchQuery
                                ? "別のキーワードで試してみろ"
                                : "ホームから爆速で記録を追加しろ"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredRecords.map((record) => {
                            const category: RecordCategory = isQuote(record) ? "quote" : record.category;
                            return (
                                <button
                                    key={record.id}
                                    onClick={() => setEditingRecord(record)}
                                    className="w-full text-left glass rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                                            <span className="text-lg">{CATEGORY_ICONS[category]}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] text-white/40 px-2 py-0.5 bg-white/5 rounded-full">
                                                    {CATEGORY_LABELS[category]}
                                                </span>
                                                <span className="text-[10px] text-white/30">
                                                    {formatDate(record.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-white text-sm line-clamp-2">{record.content}</p>
                                            {isQuote(record) && record.context && (
                                                <p className="text-white/40 text-xs mt-1 line-clamp-1">
                                                    📎 {record.context}
                                                </p>
                                            )}
                                            {record.tags && record.tags.length > 0 && (
                                                <div className="flex gap-1 mt-2 flex-wrap">
                                                    {record.tags.slice(0, 3).map((tag, i) => (
                                                        <span
                                                            key={i}
                                                            className="text-[10px] text-white/50 px-2 py-0.5 bg-white/5 rounded-full"
                                                        >
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                    {record.tags.length > 3 && (
                                                        <span className="text-[10px] text-white/30">
                                                            +{record.tags.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <svg className="w-4 h-4 text-white/20 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
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

            {/* 編集モーダル */}
            {editingRecord && (
                <RecordEditModal
                    record={editingRecord}
                    isOpen={!!editingRecord}
                    onClose={() => setEditingRecord(null)}
                    onSaved={handleRecordSaved}
                />
            )}
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
            {active && <div className="absolute bottom-0 w-1 h-1 rounded-full bg-red-500" />}
        </Link>
    );
}
