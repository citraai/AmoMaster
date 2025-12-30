"use client";

import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="min-h-screen hero-pattern">
            {/* ヘッダー */}
            <header className="sticky top-0 z-50 glass border-b border-white/5">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
                    <Link
                        href="/settings"
                        className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors"
                    >
                        <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-white font-bold text-lg">📜 利用規約</h1>
                        <p className="text-white/40 text-[10px]">Terms of Service</p>
                    </div>
                </div>
            </header>

            {/* コンテンツ */}
            <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
                <div className="glass rounded-2xl p-6 border border-white/5 space-y-6 text-white/80 text-sm leading-relaxed">
                    <section>
                        <p className="text-white/50 text-xs mb-4">最終更新日: 2024年12月31日</p>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">第1条（適用）</h2>
                        <p>
                            本規約は、AmoMaster（以下「本アプリ」）の提供者（以下「運営者」）と、本アプリを利用するユーザー（以下「ユーザー」）との間の利用条件を定めるものです。ユーザーは本規約に同意の上、本アプリを利用するものとします。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">第2条（サービス内容）</h2>
                        <p>本アプリは、以下のサービスを提供します。</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-white/70">
                            <li>パートナーの好み・NG情報の記録機能</li>
                            <li>名言・エピソードの記録機能</li>
                            <li>イベント・記念日の管理機能</li>
                            <li>AIアドバイザーによるアドバイス機能</li>
                            <li>デイリーミッション機能</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">第3条（アカウント）</h2>
                        <ol className="list-decimal list-inside space-y-2 text-white/70">
                            <li>ユーザーは、本アプリの利用にあたり、正確な情報を登録するものとします。</li>
                            <li>ユーザーは、自己の責任においてアカウント情報を管理し、第三者に使用させてはなりません。</li>
                            <li>ユーザーは、設定画面よりいつでもアカウントを削除することができます。</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">第4条（禁止事項）</h2>
                        <p>ユーザーは、本アプリの利用にあたり、以下の行為を行ってはなりません。</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-white/70">
                            <li>法令または公序良俗に違反する行為</li>
                            <li>犯罪行為に関連する行為</li>
                            <li>本アプリのサーバーまたはネットワークの機能を妨害する行為</li>
                            <li>本アプリの運営を妨害する行為</li>
                            <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                            <li>不正アクセスをし、またはこれを試みる行為</li>
                            <li>他のユーザーに成りすます行為</li>
                            <li>反社会的勢力に対して直接または間接に利益を供与する行為</li>
                            <li>その他、運営者が不適切と判断する行為</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">第5条（AIサービスについて）</h2>
                        <ol className="list-decimal list-inside space-y-2 text-white/70">
                            <li>本アプリのAI機能は、OpenAI社のGPT-4o-miniを利用しています。</li>
                            <li>AIによる回答は参考情報であり、正確性や完全性を保証するものではありません。</li>
                            <li>AIによるアドバイスに基づく行動の結果について、運営者は責任を負いません。</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">第6条（サービスの変更・停止）</h2>
                        <p>
                            運営者は、ユーザーに事前の通知なく、本アプリの内容を変更し、または本アプリの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">第7条（免責事項）</h2>
                        <ol className="list-decimal list-inside space-y-2 text-white/70">
                            <li>運営者は、本アプリに事実上または法律上の瑕疵がないことを保証するものではありません。</li>
                            <li>運営者は、本アプリの利用によりユーザーに生じたあらゆる損害について一切の責任を負いません。</li>
                            <li>運営者は、ユーザー間またはユーザーと第三者との間で生じたトラブルについて一切の責任を負いません。</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">第8条（利用規約の変更）</h2>
                        <p>
                            運営者は、必要と判断した場合には、ユーザーに通知することなく本規約を変更することができるものとします。変更後の利用規約は、本アプリ上に表示した時点から効力を生じるものとします。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">第9条（準拠法・裁判管轄）</h2>
                        <p>
                            本規約の解釈にあたっては、日本法を準拠法とします。本アプリに関して紛争が生じた場合には、運営者の所在地を管轄する裁判所を専属的合意管轄とします。
                        </p>
                    </section>

                    <section className="pt-4 border-t border-white/10">
                        <p className="text-white/50 text-xs">
                            本利用規約についてご不明な点がございましたら、アプリ内の「問題を報告」機能よりお問い合わせください。
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
