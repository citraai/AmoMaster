"use client";

import { Event, EVENT_TYPE_ICONS, getDaysUntil } from "@/lib/types";

interface EventCardProps {
    event: Event & { daysUntil?: number };
    onClick?: () => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
    const daysUntil = event.daysUntil ?? getDaysUntil(event.date, event.isRecurring);
    const isToday = daysUntil === 0;
    const isSoon = daysUntil <= 7 && daysUntil > 0;

    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-4 rounded-xl border transition-all ${isToday
                    ? "bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-500/30"
                    : isSoon
                        ? "bg-yellow-500/10 border-yellow-500/20"
                        : "bg-white/5 border-white/5 hover:border-white/10"
                }`}
        >
            <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isToday
                        ? "bg-red-500/30"
                        : isSoon
                            ? "bg-yellow-500/20"
                            : "bg-white/10"
                    }`}>
                    <span className="text-2xl">{EVENT_TYPE_ICONS[event.type]}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{event.title}</p>
                    <p className="text-white/40 text-xs">
                        {new Date(event.date).toLocaleDateString("ja-JP", {
                            month: "long",
                            day: "numeric",
                        })}
                        {event.isRecurring && " 🔁"}
                    </p>
                </div>
                <div className="text-right">
                    {isToday ? (
                        <div className="text-red-400 animate-pulse">
                            <p className="text-lg font-bold">TODAY!</p>
                            <p className="text-xs">今日だぞ！</p>
                        </div>
                    ) : (
                        <div>
                            <p className={`text-2xl font-bold ${isSoon ? "text-yellow-400" : "text-white"}`}>
                                {daysUntil}
                            </p>
                            <p className="text-white/40 text-xs">日後</p>
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
}

interface EventsListProps {
    events: (Event & { daysUntil?: number })[];
    onEventClick?: (event: Event) => void;
}

export function EventsList({ events, onEventClick }: EventsListProps) {
    if (events.length === 0) {
        return (
            <div className="text-center py-6">
                <p className="text-white/40 text-sm mb-2">まだイベントが登録されていない</p>
                <p className="text-white/20 text-xs">記念日や誕生日を登録して、備えろ</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {events.map((event) => (
                <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => onEventClick?.(event)}
                />
            ))}
        </div>
    );
}
