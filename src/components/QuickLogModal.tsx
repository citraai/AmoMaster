"use client";

import { useState, useEffect, useRef } from "react";
import { RecordCategory, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/types";
import * as dataService from "@/lib/data-service";
import { RECORD_FEEDBACK_MESSAGES } from "@/lib/ai/prompts";

interface QuickLogModalProps {
    isOpen: boolean;
    category: RecordCategory;
    onClose: () => void;
    onSaved?: () => void;
}

export default function QuickLogModal({
    isOpen,
    category,
    onClose,
    onSaved,
}: QuickLogModalProps) {
    const [content, setContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setContent("");
            setFeedback(null);
            // モーダルが開いたら入力フィールドにフォーカス
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSave = async () => {
        if (!content.trim()) return;

        setIsSaving(true);

        try {
            // DB保存処理
            if (category === "quote") {
                await dataService.createQuote({ content });
            } else {
                await dataService.createPreference({ category, content });
            }

            // フィードバックメッセージをランダムに選択
            const feedbackMessages = RECORD_FEEDBACK_MESSAGES.positive;
            const randomMessage =
                feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)];
            setFeedback(randomMessage);

            // フィードバック表示後に閉じる
            setTimeout(() => {
                setIsSaving(false);
                onSaved?.();
                onClose();
            }, 1500);
        } catch (error) {
            console.error("保存エラー:", error);
            setIsSaving(false);
            setFeedback("保存に失敗しました...");
            setTimeout(() => {
                onClose();
            }, 1500);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* オーバーレイ */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* モーダル */}
            <div className="relative w-full max-w-lg mx-4 mb-4 sm:mb-0 animate-slide-up">
                <div className="glass border border-white/10 rounded-3xl p-6 shadow-2xl">
                    {/* ヘッダー */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center text-2xl">
                                {CATEGORY_ICONS[category]}
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">
                                    {CATEGORY_LABELS[category]}
                                </h3>
                                <p className="text-white/50 text-xs">爆速で記録しろ 💨</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <svg
                                className="w-5 h-5 text-white/70"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* 入力フィールド */}
                    {!feedback ? (
                        <>
                            <input
                                ref={inputRef}
                                type="text"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={
                                    category === "quote"
                                        ? "パートナーが言った言葉を記録..."
                                        : "何を記録する？"
                                }
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all mb-4"
                                disabled={isSaving}
                            />

                            {/* ボタン */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-colors text-sm font-medium"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!content.trim() || isSaving}
                                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold hover:shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    {isSaving ? "保存中..." : "記録する 🔥"}
                                </button>
                            </div>
                        </>
                    ) : (
                        // フィードバック表示
                        <div className="text-center py-8 animate-pulse">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-3xl">
                                ✓
                            </div>
                            <p className="text-white font-bold text-lg mb-2">記録完了！</p>
                            <p className="text-white/70 text-sm">「{feedback}」</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
