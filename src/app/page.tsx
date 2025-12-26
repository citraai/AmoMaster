"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MasterAdvice from "@/components/MasterAdvice";
import { QuickLogGrid } from "@/components/QuickLogButton";
import { StatsGrid } from "@/components/StatsCard";
import QuickLogModal from "@/components/QuickLogModal";
import RecordsList from "@/components/RecordsList";
import { EventsList } from "@/components/EventCard";
import EventModal from "@/components/EventModal";
import { RecordCategory, Event, Preference, Quote } from "@/lib/types";
import * as dataService from "@/lib/data-service";

type RecentRecord = (Preference | Quote) & { type: "preference" | "quote" };

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<RecordCategory>("like");
  const [recentRecords, setRecentRecords] = useState<RecentRecord[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<(Event & { daysUntil?: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 認証チェック
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // データ読み込み
  const loadData = async () => {
    if (status !== "authenticated") return;

    try {
      setIsLoading(true);
      const [prefs, quotes, events] = await Promise.all([
        dataService.getPreferences(),
        dataService.getQuotes(),
        dataService.getEvents(),
      ]);

      // 最近の記録を結合（直近5件）
      const allRecords: RecentRecord[] = [
        ...prefs.map((p: Preference) => ({ ...p, type: "preference" as const })),
        ...quotes.map((q: Quote) => ({ ...q, type: "quote" as const })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      setRecentRecords(allRecords);

      // 今後のイベント
      const today = new Date();
      const upcoming = events
        .map((e: Event) => ({
          ...e,
          daysUntil: Math.ceil((new Date(e.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        }))
        .filter((e: Event & { daysUntil: number }) => e.daysUntil >= 0)
        .sort((a: Event & { daysUntil: number }, b: Event & { daysUntil: number }) => a.daysUntil - b.daysUntil)
        .slice(0, 3);

      setUpcomingEvents(upcoming);
    } catch (error) {
      console.error("データ読み込みエラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      loadData();
    }
  }, [status]);

  const handleQuickLogClick = (type: string) => {
    setSelectedCategory(type as RecordCategory);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleRecordSaved = () => {
    // 記録が保存されたら最新データを再読み込み
    loadData();
  };

  // ローディング中
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen hero-pattern flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-4 animate-pulse">💕</div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  // 未認証
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen hero-pattern">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
              <span className="text-lg">💕</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight">AmoMaster</h1>
              <p className="text-white/40 text-[10px]">パートナーを世界一幸せに</p>
            </div>
          </div>
          <Link href="/settings" className="p-2 rounded-full hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-lg mx-auto px-4 pb-24">
        {/* ウェルカムセクション */}
        <section className="pt-6 pb-4">
          <p className="text-white/60 text-sm mb-1">おかえり、野郎ども 👊</p>
          <h2 className="text-2xl font-bold text-white">
            今日も<span className="text-gradient">戦う</span>準備はいいか？
          </h2>
        </section>

        {/* 恋愛マスターからの喝 */}
        <section className="mb-6">
          <MasterAdvice />
        </section>

        {/* 統計グリッド */}
        <section className="mb-6">
          <h3 className="text-white/60 text-xs font-medium mb-3 flex items-center gap-2">
            <span>📊</span> お前の戦績
          </h3>
          <StatsGrid />
        </section>

        {/* クイックログボタン */}
        <section className="mb-6">
          <h3 className="text-white/60 text-xs font-medium mb-3 flex items-center gap-2">
            <span>⚡</span> 爆速記録（3タップで完了）
          </h3>
          <QuickLogGrid onLogClick={handleQuickLogClick} />
        </section>

        {/* 次のイベントリマインダー */}
        <section className="mb-6">
          <div className="glass rounded-2xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white/60 text-xs font-medium flex items-center gap-2">
                <span>📅</span> 次の重要イベント
              </h3>
              <button
                onClick={() => setIsEventModalOpen(true)}
                className="text-xs text-white/40 hover:text-white/60 transition-colors"
              >
                + 追加
              </button>
            </div>
            <EventsList events={upcomingEvents} />
          </div>
        </section>

        {/* 最近の記録 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white/60 text-xs font-medium flex items-center gap-2">
              <span>📝</span> 最近の記録
            </h3>
            <button className="text-xs text-white/40 hover:text-white/60 transition-colors">
              すべて見る →
            </button>
          </div>
          <RecordsList records={recentRecords} />
        </section>
      </main>

      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/5">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <NavItem href="/" icon="🏠" label="ホーム" active />
            <NavItem href="/records" icon="📚" label="記録" />
            <NavItem href="/missions" icon="🎯" label="ミッション" />
            <NavItem href="/mine-checker" icon="💣" label="地雷" />
            <NavItem href="/master" icon="🧠" label="マスター" />
            <NavItem href="/settings" icon="⚙️" label="設定" />
          </div>
        </div>
      </nav>

      {/* QuickLogModal */}
      <QuickLogModal
        isOpen={isModalOpen}
        category={selectedCategory}
        onClose={handleModalClose}
        onSaved={handleRecordSaved}
      />

      {/* EventModal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSaved={loadData}
      />
    </div>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${active
        ? "text-white"
        : "text-white/40 hover:text-white/60"
        }`}
    >
      <span className={`text-xl ${active ? "scale-110" : ""} transition-transform`}>{icon}</span>
      <span className="text-[10px] font-medium">{label}</span>
      {active && (
        <div className="absolute bottom-0 w-1 h-1 rounded-full bg-red-500" />
      )}
    </Link>
  );
}
