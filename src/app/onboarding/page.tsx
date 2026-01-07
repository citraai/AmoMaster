"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as dataService from "@/lib/data-service";

type Gender = "male" | "female" | "other" | "unspecified";
type PartnerPronoun = "he" | "she" | "partner";

export default function OnboardingPage() {
    const [step, setStep] = useState(0); // 0: 利用規約同意, 1: 性別, 2: パートナー呼称
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [gender, setGender] = useState<Gender | null>(null);
    const [genderCustom, setGenderCustom] = useState("");
    const [partnerPronoun, setPartnerPronoun] = useState<PartnerPronoun | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const genderOptions = [
        { value: "male" as Gender, label: "男性", icon: "👨" },
        { value: "female" as Gender, label: "女性", icon: "👩" },
        { value: "other" as Gender, label: "その他", icon: "🌈" },
        { value: "unspecified" as Gender, label: "選択しない", icon: "🙂" },
    ];

    const pronounOptions = [
        { value: "he" as PartnerPronoun, label: "彼", description: "彼の好きなもの、彼のNG..." },
        { value: "she" as PartnerPronoun, label: "彼女", description: "彼女の好きなもの、彼女のNG..." },
        { value: "partner" as PartnerPronoun, label: "パートナー", description: "パートナーの好きなもの..." },
    ];

    const handleComplete = async () => {
        setIsSaving(true);
        try {
            // DBにプロファイル保存
            await dataService.updateUserProfile({
                gender: gender || "unspecified",
                genderCustom: gender === "other" ? genderCustom : undefined,
                partnerPronoun: partnerPronoun || "partner",
            });
            router.push("/");
        } catch (error) {
            console.error("プロファイル保存エラー:", error);
            // エラーでもホームへ遷移
            router.push("/");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen hero-pattern flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* ヘッダー */}
                <div className="text-center mb-8">
                    <div className="text-4xl mb-4">{step === 0 ? "📜" : "✨"}</div>
                    <h1 className="text-white text-xl font-bold">
                        {step === 0 ? "ご利用の前に" : "プロフィール設定"}
                    </h1>
                    <p className="text-white/60 text-sm mt-2">
                        {step === 0
                            ? "利用規約をご確認ください"
                            : "あなたに合わせた体験を提供します"}
                    </p>
                </div>

                {/* プログレスバー */}
                <div className="flex gap-2 mb-8">
                    <div className={`flex-1 h-1 rounded-full ${step >= 0 ? "bg-pink-500" : "bg-white/10"}`} />
                    <div className={`flex-1 h-1 rounded-full ${step >= 1 ? "bg-pink-500" : "bg-white/10"}`} />
                    <div className={`flex-1 h-1 rounded-full ${step >= 2 ? "bg-pink-500" : "bg-white/10"}`} />
                </div>

                {/* ステップ0: 利用規約同意 */}
                {step === 0 && (
                    <div className="card-dark p-6">
                        <h2 className="text-white font-bold mb-4">利用規約への同意</h2>
                        <p className="text-white/60 text-sm mb-4">
                            AmoMasterをご利用いただくには、利用規約とプライバシーポリシーへの同意が必要です。
                        </p>

                        <div className="space-y-3 mb-6">
                            <Link
                                href="/terms"
                                target="_blank"
                                className="block w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-white flex items-center gap-2">
                                        <span>📜</span> 利用規約
                                    </span>
                                    <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </div>
                            </Link>
                            <Link
                                href="/privacy"
                                target="_blank"
                                className="block w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-white flex items-center gap-2">
                                        <span>🔒</span> プライバシーポリシー
                                    </span>
                                    <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </div>
                            </Link>
                        </div>

                        <div className="flex items-start gap-3 mb-6 p-3 rounded-xl bg-white/5 border border-white/10">
                            <input
                                type="checkbox"
                                id="agree-terms"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="mt-1 w-5 h-5 rounded border-white/30 bg-white/5 text-pink-500 focus:ring-pink-500 focus:ring-offset-0"
                            />
                            <label htmlFor="agree-terms" className="text-white text-sm leading-relaxed">
                                利用規約とプライバシーポリシーに同意します
                            </label>
                        </div>

                        <button
                            onClick={() => setStep(1)}
                            disabled={!agreedToTerms}
                            className="w-full bg-gradient-to-r from-pink-600 to-red-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            同意して次へ
                        </button>
                    </div>
                )}

                {/* ステップ1: 性別選択 */}
                {step === 1 && (
                    <div className="card-dark p-6">
                        <h2 className="text-white font-bold mb-4">あなたの性別は？</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {genderOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setGender(option.value)}
                                    className={`p-4 rounded-xl border-2 transition-all ${gender === option.value
                                        ? "border-pink-500 bg-pink-500/10"
                                        : "border-white/10 bg-white/5 hover:border-white/20"
                                        }`}
                                >
                                    <div className="text-2xl mb-2">{option.icon}</div>
                                    <div className="text-white text-sm">{option.label}</div>
                                </button>
                            ))}
                        </div>

                        {/* その他の場合の入力 */}
                        {gender === "other" && (
                            <div className="mt-4">
                                <input
                                    type="text"
                                    value={genderCustom}
                                    onChange={(e) => setGenderCustom(e.target.value)}
                                    placeholder="自由に入力（任意）"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50"
                                />
                            </div>
                        )}

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setStep(0)}
                                className="flex-1 bg-white/10 text-white py-3 rounded-lg hover:bg-white/20 transition-colors"
                            >
                                戻る
                            </button>
                            <button
                                onClick={() => setStep(2)}
                                disabled={!gender}
                                className="flex-1 bg-gradient-to-r from-pink-600 to-red-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                次へ
                            </button>
                        </div>
                    </div>
                )}

                {/* ステップ2: パートナー呼称選択 */}
                {step === 2 && (
                    <div className="card-dark p-6">
                        <h2 className="text-white font-bold mb-2">パートナーの呼び方は？</h2>
                        <p className="text-white/50 text-sm mb-4">
                            アプリ内での表示に使用します
                        </p>
                        <div className="space-y-3">
                            {pronounOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setPartnerPronoun(option.value)}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${partnerPronoun === option.value
                                        ? "border-pink-500 bg-pink-500/10"
                                        : "border-white/10 bg-white/5 hover:border-white/20"
                                        }`}
                                >
                                    <div className="text-white font-medium">{option.label}</div>
                                    <div className="text-white/50 text-sm">{option.description}</div>
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setStep(1)}
                                disabled={isSaving}
                                className="flex-1 bg-white/10 text-white py-3 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
                            >
                                戻る
                            </button>
                            <button
                                onClick={handleComplete}
                                disabled={!partnerPronoun || isSaving}
                                className="flex-1 bg-gradient-to-r from-pink-600 to-red-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {isSaving ? "保存中..." : "完了"}
                            </button>
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
}
