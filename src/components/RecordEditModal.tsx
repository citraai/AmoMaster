"use client";

import { useState } from "react";
import { Preference, Quote, RecordCategory, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/types";
import { updatePreference, updateQuote, deletePreference, deleteQuote } from "@/lib/storage";

interface RecordEditModalProps {
    record: Preference | Quote;
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
}

function isQuote(record: Preference | Quote): record is Quote {
    return "context" in record;
}

export default function RecordEditModal({ record, isOpen, onClose, onSaved }: RecordEditModalProps) {
    const [content, setContent] = useState(record.content);
    const [context, setContext] = useState(isQuote(record) ? record.context || "" : "");
    const [tags, setTags] = useState(record.tags?.join(", ") || "");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const category: RecordCategory = isQuote(record) ? "quote" : record.category;

    const handleSave = () => {
        if (!content.trim()) return;
        setIsSaving(true);

        const parsedTags = tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t);

        if (isQuote(record)) {
            updateQuote(record.id, {
                content: content.trim(),
                context: context.trim() || undefined,
                tags: parsedTags.length > 0 ? parsedTags : undefined,
            });
        } else {
            updatePreference(record.id, {
                content: content.trim(),
                tags: parsedTags.length > 0 ? parsedTags : undefined,
            });
        }

        setIsSaving(false);
        onSaved();
        onClose();
    };

    const handleDelete = () => {
        if (isQuote(record)) {
            deleteQuote(record.id);
        } else {
            deletePreference(record.id);
        }
        onSaved();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-zinc-900 rounded-t-3xl sm:rounded-2xl border border-white/10 max-h-[85vh] overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{CATEGORY_ICONS[category]}</span>
                        <h2 className="text-white font-semibold">{CATEGORY_LABELS[category]}を編集</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
                    {/* メイン入力 */}
                    <div>
                        <label className="block text-white/60 text-xs mb-2">
                            {isQuote(record) ? "パートナーの言葉" : "内容"}
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-red-500/50 resize-none"
                            rows={3}
                            placeholder="記録内容を入力..."
                        />
                    </div>

                    {/* Quote用: コンテキスト */}
                    {isQuote(record) && (
                        <div>
                            <label className="block text-white/60 text-xs mb-2">状況・文脈（任意）</label>
                            <input
                                type="text"
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-red-500/50"
                                placeholder="どんな状況での発言？"
                            />
                        </div>
                    )}

                    {/* タグ */}
                    <div>
                        <label className="block text-white/60 text-xs mb-2">タグ（カンマ区切り）</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-red-500/50"
                            placeholder="食べ物, 記念日, etc..."
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-white/5 space-y-3">
                    {showDeleteConfirm ? (
                        <div className="flex items-center justify-between bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                            <p className="text-red-400 text-sm">本当に削除する？</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-3 py-1 text-white/60 text-sm hover:text-white transition-colors"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    削除
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full py-2 text-red-400/60 text-sm hover:text-red-400 transition-colors"
                        >
                            この記録を削除
                        </button>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={!content.trim() || isSaving}
                        className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                    >
                        {isSaving ? "保存中..." : "保存する"}
                    </button>
                </div>
            </div>
        </div>
    );
}
