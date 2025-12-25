"use client";

import { Preference, Quote, CATEGORY_ICONS, formatDate } from "@/lib/types";

interface RecordsListProps {
    records: (Preference | Quote)[];
    className?: string;
}

export default function RecordsList({ records, className = "" }: RecordsListProps) {
    if (records.length === 0) {
        return (
            <div className="glass rounded-2xl p-6 border border-white/5 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                    <span className="text-3xl">📭</span>
                </div>
                <p className="text-white/40 text-sm mb-1">まだ何も記録されていない</p>
                <p className="text-white/20 text-xs">まずはパートナーの「好き」を記録しろ</p>
            </div>
        );
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {records.map((record) => {
                const isQuote = "context" in record;
                const category = isQuote ? "quote" as const : (record as Preference).category;
                const icon = CATEGORY_ICONS[category];

                return (
                    <div
                        key={record.id}
                        className="glass rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all group"
                    >
                        <div className="flex items-start gap-3">
                            {/* アイコン */}
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                                {icon}
                            </div>

                            {/* コンテンツ */}
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium mb-1 break-words">
                                    {record.content}
                                </p>

                                {/* タグ */}
                                {record.tags && record.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {record.tags.map((tag, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-0.5 rounded-full bg-white/5 text-white/50 text-xs"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* 日時 */}
                                <p className="text-white/40 text-xs">
                                    {formatDate(record.createdAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
