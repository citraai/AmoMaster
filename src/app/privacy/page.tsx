"use client";

import Link from "next/link";

export default function PrivacyPage() {
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
                        <h1 className="text-white font-bold text-lg">🔒 プライバシーポリシー</h1>
                        <p className="text-white/40 text-[10px]">Privacy Policy</p>
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
                        <h2 className="text-white font-semibold text-lg mb-3">1. はじめに</h2>
                        <p>
                            AmoMaster（以下「本アプリ」）の運営者（以下「運営者」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本プライバシーポリシーは、本アプリにおける個人情報の取り扱いについて説明するものです。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">2. 収集する情報</h2>
                        <p>本アプリでは、以下の情報を収集します。</p>

                        <h3 className="text-white font-medium mt-4 mb-2">2.1 ユーザーが提供する情報</h3>
                        <ul className="list-disc list-inside space-y-1 text-white/70">
                            <li>メールアドレス（アカウント作成時）</li>
                            <li>パスワード（暗号化して保存）</li>
                            <li>性別情報（任意）</li>
                            <li>パートナーに関する記録情報（好み、NG、名言、イベント等）</li>
                        </ul>

                        <h3 className="text-white font-medium mt-4 mb-2">2.2 自動的に収集される情報</h3>
                        <ul className="list-disc list-inside space-y-1 text-white/70">
                            <li>アクセス日時</li>
                            <li>利用状況（ミッション達成状況等）</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">3. 情報の利用目的</h2>
                        <p>収集した情報は、以下の目的で利用します。</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-white/70">
                            <li>本アプリのサービス提供</li>
                            <li>AIアドバイザー機能によるパーソナライズされたアドバイスの提供</li>
                            <li>サービスの改善・新機能の開発</li>
                            <li>ユーザーからのお問い合わせへの対応</li>
                            <li>利用規約違反への対応</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">4. 第三者への情報提供</h2>
                        <p>運営者は、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-white/70">
                            <li>ユーザーの同意がある場合</li>
                            <li>法令に基づく場合</li>
                            <li>人の生命、身体または財産の保護のために必要な場合</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">5. 外部サービスの利用</h2>
                        <p>本アプリでは、以下の外部サービスを利用しています。</p>

                        <h3 className="text-white font-medium mt-4 mb-2">5.1 OpenAI API</h3>
                        <p className="text-white/70">
                            AIアドバイザー機能（GPT-4o-mini）のために利用しています。ユーザーの記録情報がAI処理のために送信されますが、OpenAI社による情報の保存期間はOpenAI社のプライバシーポリシーに従います。
                        </p>

                        <h3 className="text-white font-medium mt-4 mb-2">5.2 Turso Database</h3>
                        <p className="text-white/70">
                            ユーザーデータの保存に利用しています。データは暗号化された通信で送受信されます。
                        </p>

                        <h3 className="text-white font-medium mt-4 mb-2">5.3 Vercel</h3>
                        <p className="text-white/70">
                            アプリケーションのホスティングに利用しています。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">6. データの保護</h2>
                        <p>運営者は、ユーザーの個人情報を保護するために、以下の対策を講じています。</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-white/70">
                            <li>パスワードのハッシュ化</li>
                            <li>HTTPS通信による暗号化</li>
                            <li>ユーザーごとのデータ分離</li>
                            <li>定期的なセキュリティ確認</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">7. データの削除</h2>
                        <p>
                            ユーザーは、設定画面の「アカウントを削除（退会）」機能により、いつでもアカウントおよび関連するすべてのデータを完全に削除することができます。削除されたデータは復元できません。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">8. Cookie・ローカルストレージ</h2>
                        <p>
                            本アプリでは、認証情報の管理のためにCookieおよびローカルストレージを使用しています。これらはサービスの提供に必要なものであり、第三者への情報提供には使用しません。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">9. お子様のプライバシー</h2>
                        <p>
                            本アプリは13歳未満のお子様を対象としていません。13歳未満であることが判明した場合、当該アカウントは削除されます。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">10. プライバシーポリシーの変更</h2>
                        <p>
                            運営者は、必要に応じて本プライバシーポリシーを変更することがあります。重要な変更がある場合は、アプリ内で通知します。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white font-semibold text-lg mb-3">11. お問い合わせ</h2>
                        <p>
                            本プライバシーポリシーに関するお問い合わせは、アプリ内の「問題を報告」機能よりお願いいたします。
                        </p>
                    </section>

                    <section className="pt-4 border-t border-white/10">
                        <p className="text-white/50 text-xs">
                            本プライバシーポリシーは日本法を準拠法とします。
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
