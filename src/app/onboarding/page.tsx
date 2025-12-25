"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as dataService from "@/lib/data-service";

type Gender = "male" | "female" | "other" | "unspecified";
type PartnerPronoun = "he" | "she" | "partner";

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
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
                    <div className="text-4xl mb-4">✨</div>
                    <h1 className="text-white text-xl font-bold">プロフィール設定</h1>
                    <p className="text-white/60 text-sm mt-2">
                        あなたに合わせた体験を提供します
                    </p>
                </div>

                {/* プログレスバー */}
                <div className="flex gap-2 mb-8">
                    <div className={`flex-1 h-1 rounded-full ${step >= 1 ? "bg-pink-500" : "bg-white/10"}`} />
                    <div className={`flex-1 h-1 rounded-full ${step >= 2 ? "bg-pink-500" : "bg-white/10"}`} />
                </div>

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

                        <button
                            onClick={() => setStep(2)}
                            disabled={!gender}
                            className="w-full mt-6 bg-gradient-to-r from-pink-600 to-red-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            次へ
                        </button>
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

                {/* スキップ */}
                <button
                    onClick={handleComplete}
                    className="w-full mt-4 text-white/40 text-sm hover:text-white/60 transition-colors"
                >
                    あとで設定する
                </button>
            </div>
        </div>
    );
}
