"use client";

import { useState } from "react";
import { EventType, EVENT_TYPE_LABELS, EVENT_TYPE_ICONS } from "@/lib/types";
import * as dataService from "@/lib/data-service";

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
}

const EVENT_TYPES: EventType[] = ["birthday", "anniversary", "date", "other"];

export default function EventModal({ isOpen, onClose, onSaved }: EventModalProps) {
    const [type, setType] = useState<EventType>("anniversary");
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [isRecurring, setIsRecurring] = useState(true);
    const [notes, setNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!title.trim() || !date) return;
        setIsSaving(true);

        try {
            await dataService.createEvent({
                type,
                title: title.trim(),
                date,
                isRecurring,
                notes: notes.trim() || undefined,
            });

            // リセット
            setTitle("");
            setDate("");
            setNotes("");
            setIsRecurring(true);
            setIsSaving(false);

            onSaved();
            onClose();
        } catch (error) {
            console.error("イベント保存エラー:", error);
            setIsSaving(false);
        }
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
                    <h2 className="text-white font-semibold flex items-center gap-2">
                        <span>📅</span> イベントを追加
                    </h2>
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
                    {/* イベントタイプ */}
                    <div>
                        <label className="block text-white/60 text-xs mb-2">タイプ</label>
                        <div className="grid grid-cols-4 gap-2">
                            {EVENT_TYPES.map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setType(t)}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${type === t
                                        ? "border-red-500 bg-red-500/10"
                                        : "border-white/10 bg-white/5 hover:bg-white/10"
                                        }`}
                                >
                                    <span className="text-xl">{EVENT_TYPE_ICONS[t]}</span>
                                    <span className="text-xs text-white/60">{EVENT_TYPE_LABELS[t]}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* タイトル */}
                    <div>
                        <label className="block text-white/60 text-xs mb-2">タイトル</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-red-500/50"
                            placeholder="例: 〇〇の誕生日"
                        />
                    </div>

                    {/* 日付 */}
                    <div>
                        <label className="block text-white/60 text-xs mb-2">日付</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50"
                        />
                    </div>

                    {/* 毎年繰り返す */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white text-sm">毎年リマインド</p>
                            <p className="text-white/40 text-xs">誕生日や記念日に最適</p>
                        </div>
                        <button
                            onClick={() => setIsRecurring(!isRecurring)}
                            className={`w-12 h-7 rounded-full transition-colors relative ${isRecurring ? "bg-red-500" : "bg-white/20"
                                }`}
                        >
                            <div
                                className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${isRecurring ? "translate-x-6" : "translate-x-1"
                                    }`}
                            />
                        </button>
                    </div>

                    {/* メモ */}
                    <div>
                        <label className="block text-white/60 text-xs mb-2">メモ（任意）</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-red-500/50 resize-none"
                            rows={2}
                            placeholder="プレゼントのアイデアなど..."
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleSave}
                        disabled={!title.trim() || !date || isSaving}
                        className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                    >
                        {isSaving ? "保存中..." : "登録する 🎉"}
                    </button>
                </div>
            </div>
        </div>
    );
}
