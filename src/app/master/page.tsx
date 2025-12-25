"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getSettings } from "@/lib/storage";
import { sendMessage, detectProvider, getProviderLabel, AIProvider } from "@/lib/ai/ai-service";

interface Message {
    id: string;
    role: "user" | "master";
    content: string;
    timestamp: Date;
    provider?: AIProvider;
}

export default function MasterPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [partnerName, setPartnerName] = useState("彼女");
    const [currentProvider, setCurrentProvider] = useState<AIProvider>("mock");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const init = async () => {
            const settings = getSettings();
            setPartnerName(settings.partnerName);

            // AIプロバイダーを検出
            const provider = await detectProvider();
            setCurrentProvider(provider);

            setMessages([
                {
                    id: "welcome",
                    role: "master",
                    content: `よう、来たな。${settings.partnerName}のことで悩みでもあるのか？何でも聞いてやる。ただし、甘ったれた質問には容赦なく喝を入れるからな 👊`,
                    timestamp: new Date(),
                },
            ]);
        };
        init();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim() || isTyping) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: inputValue.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsTyping(true);

        try {
            // AIサービスを呼び出し
            const response = await sendMessage(userMessage.content);

            const masterMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "master",
                content: response.text,
                timestamp: new Date(),
                provider: response.provider,
            };

            setMessages((prev) => [...prev, masterMessage]);
            setCurrentProvider(response.provider);
        } catch (error) {
            console.error("AI error:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "master",
                content: "おい、俺の調子が悪いみたいだ。もう一度聞いてくれ 😅",
                timestamp: new Date(),
                provider: "mock",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const getProviderColor = (provider: AIProvider) => {
        switch (provider) {
            case "nano": return "bg-green-500";
            case "api": return "bg-blue-500";
            case "mock": return "bg-yellow-500";
        }
    };

    return (
        <div className="min-h-screen hero-pattern flex flex-col">
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
                            <h1 className="text-white font-bold text-lg">🧠 恋愛マスター</h1>
                            <p className="text-white/40 text-[10px]">毒舌だが愛はある</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full">
                        <span className={`w-2 h-2 rounded-full ${getProviderColor(currentProvider)} animate-pulse`} />
                        <span className="text-xs text-white/60">
                            {currentProvider === "nano" ? "Nano" : currentProvider === "api" ? "API" : "Demo"}
                        </span>
                    </div>
                </div>
            </header>

            {/* メッセージエリア */}
            <main className="flex-1 overflow-y-auto pb-32">
                <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {message.role === "master" && (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mr-2 flex-shrink-0">
                                    <span className="text-lg">👨‍🏫</span>
                                </div>
                            )}
                            <div
                                className={`max-w-[80%] p-4 rounded-2xl ${message.role === "user"
                                    ? "bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-br-md"
                                    : "glass border border-white/10 text-white rounded-bl-md"
                                    }`}
                            >
                                <p className="text-sm leading-relaxed">{message.content}</p>
                                <div className={`flex items-center gap-2 mt-2 ${message.role === "user" ? "justify-end" : ""}`}>
                                    <p className={`text-[10px] ${message.role === "user" ? "text-white/60" : "text-white/40"}`}>
                                        {message.timestamp.toLocaleTimeString("ja-JP", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                    {message.provider && message.role === "master" && (
                                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${message.provider === "nano" ? "bg-green-500/20 text-green-400" :
                                                message.provider === "api" ? "bg-blue-500/20 text-blue-400" :
                                                    "bg-yellow-500/20 text-yellow-400"
                                            }`}>
                                            {message.provider === "nano" ? "🏠 Nano" :
                                                message.provider === "api" ? "☁️ API" : "🎭 Demo"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mr-2">
                                <span className="text-lg">👨‍🏫</span>
                            </div>
                            <div className="glass border border-white/10 p-4 rounded-2xl rounded-bl-md">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* 入力エリア */}
            <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/5">
                <div className="max-w-lg mx-auto px-4 py-4">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSend()}
                            placeholder={`${partnerName}のことで相談...`}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-red-500/50"
                            disabled={isTyping}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                            className="px-5 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-center text-white/20 text-xs mt-2">
                        {getProviderLabel(currentProvider)}
                    </p>
                </div>
            </div>
        </div>
    );
}
