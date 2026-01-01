"use client";

import { useState } from "react";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
    const [type, setType] = useState("feature");
    const [content, setContent] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim()) return;
        setIsSending(true);

        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, content }),
            });

            if (res.ok) {
                setIsSent(true);
                setTimeout(() => {
                    onClose();
                    setIsSent(false);
                    setContent("");
                    setType("feature");
                }, 2000);
            }
        } catch (error) {
            console.error("Feedback error:", error);
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-[#FDF6E9] rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                {isSent ? (
                    <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl animate-bounce">
                            🐱
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">送信完了！</h3>
                        <p className="text-gray-600">マスターに伝えておくからな！</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-amber-200/50 bg-white/50">
                            <h2 className="text-gray-800 font-bold flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-200">
                                    <img src="/master-icon.png" alt="Icon" className="w-full h-full object-cover" />
                                </div>
                                マスターへの直訴
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-black/5 transition-colors text-gray-500"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                    種類
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: "feature", label: "機能要望 ✨" },
                                        { id: "bug", label: "バグ報告 🐛" },
                                        { id: "other", label: "その他 💭" },
                                    ].map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setType(t.id)}
                                            className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${type === t.id
                                                ? "bg-red-500 text-white shadow-md transform scale-105"
                                                : "bg-white border border-amber-200 text-gray-600 hover:bg-amber-50"
                                                }`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                    内容
                                </label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full h-32 bg-white border border-amber-200 rounded-xl p-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 resize-none transition-all"
                                    placeholder="ここが使いにくい、こんな機能が欲しい、など..."
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-amber-200/50 bg-white/50">
                            <button
                                onClick={handleSubmit}
                                disabled={!content.trim() || isSending}
                                className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isSending ? (
                                    <span className="animate-pulse">送信中...</span>
                                ) : (
                                    <>
                                        送信する 📮
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
