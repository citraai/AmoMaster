/**
 * AmoMaster - Storage管理（ハイブリッド：LocalStorage + Turso DB）
 * 
 * ブラウザ環境ではLocalStorageから読み込み、
 * 同時にTurso DBにも保存（APIルート経由で同期）
 */

import { Preference, Quote, RecordCategory, Event, Settings, generateId } from "./types";

const PREFERENCES_KEY = "herspecialist_preferences";
const QUOTES_KEY = "herspecialist_quotes";
const EVENTS_KEY = "herspecialist_events";
const SETTINGS_KEY = "herspecialist_settings";

// ==================== Turso DB同期ヘルパー（API経由） ====================

async function syncToDb(action: string, data: any): Promise<void> {
    console.log("[Sync] Starting sync...", action);

    try {
        const response = await fetch("/api/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, data }),
        });

        if (response.ok) {
            console.log("[Sync] ✅ Synced to Turso DB");
        } else {
            const errorText = await response.text();
            console.warn("[Sync] ⚠️ Failed to sync to Turso DB:", errorText);
        }
    } catch (error) {
        console.warn("[Sync] ⚠️ Failed to sync to Turso DB:", error);
        // LocalStorageは成功しているので、エラーは無視
    }
}

// ==================== Preferences ====================

export function savePreference(
    category: Exclude<RecordCategory, "quote">,
    content: string,
    tags?: string[]
): Preference {
    const preference: Preference = {
        id: generateId(),
        category,
        content,
        tags,
        createdAt: new Date().toISOString(),
    };

    const preferences = getPreferences();
    preferences.unshift(preference);

    if (typeof window !== "undefined") {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
        // Turso DBにも同期
        syncToDb("createPreference", { category, content, tags });
    }

    return preference;
}

export function getPreferences(): Preference[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(PREFERENCES_KEY);
    return data ? JSON.parse(data) : [];
}

export function updatePreference(id: string, data: Partial<Omit<Preference, "id" | "createdAt">>): void {
    const preferences = getPreferences();
    const index = preferences.findIndex(p => p.id === id);

    if (index !== -1) {
        preferences[index] = { ...preferences[index], ...data };
        if (typeof window !== "undefined") {
            localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
        }
    }
}

export function deletePreference(id: string): void {
    const preferences = getPreferences();
    const filtered = preferences.filter(p => p.id !== id);

    if (typeof window !== "undefined") {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(filtered));
    }
}

// ==================== Quotes ====================

export function saveQuote(
    content: string,
    context?: string,
    tags?: string[]
): Quote {
    const quote: Quote = {
        id: generateId(),
        content,
        context,
        tags,
        createdAt: new Date().toISOString(),
    };

    const quotes = getQuotes();
    quotes.unshift(quote);

    if (typeof window !== "undefined") {
        localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
        // Turso DBにも同期
        syncToDb("createQuote", { content, context, tags });
    }

    return quote;
}

export function getQuotes(): Quote[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(QUOTES_KEY);
    return data ? JSON.parse(data) : [];
}

export function updateQuote(id: string, data: Partial<Omit<Quote, "id" | "createdAt">>): void {
    const quotes = getQuotes();
    const index = quotes.findIndex(q => q.id === id);

    if (index !== -1) {
        quotes[index] = { ...quotes[index], ...data };
        if (typeof window !== "undefined") {
            localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
        }
    }
}

export function deleteQuote(id: string): void {
    const quotes = getQuotes();
    const filtered = quotes.filter(q => q.id !== id);

    if (typeof window !== "undefined") {
        localStorage.setItem(QUOTES_KEY, JSON.stringify(filtered));
    }
}

// ==================== Events ====================

export function saveEvent(
    type: Event["type"],
    title: string,
    date: string,
    isRecurring: boolean = false,
    notes?: string
): Event {
    const event: Event = {
        id: generateId(),
        type,
        title,
        date,
        isRecurring,
        notes,
        createdAt: new Date().toISOString(),
    };

    const events = getEvents();
    events.unshift(event);

    if (typeof window !== "undefined") {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
        // Turso DBにも同期
        syncToDb("createEvent", { type, title, date, isRecurring, notes });
    }

    return event;
}

export function getEvents(): Event[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(EVENTS_KEY);
    return data ? JSON.parse(data) : [];
}

export function getUpcomingEvents(limit: number = 5): (Event & { daysUntil?: number })[] {
    const now = new Date();
    const events = getEvents();

    return events
        .map(event => {
            const eventDate = new Date(event.date);
            const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return { ...event, daysUntil };
        })
        .filter(event => (event.daysUntil ?? 0) >= 0)
        .sort((a, b) => (a.daysUntil ?? 0) - (b.daysUntil ?? 0))
        .slice(0, limit);
}

export function updateEvent(id: string, data: Partial<Omit<Event, "id" | "createdAt">>): void {
    const events = getEvents();
    const index = events.findIndex(e => e.id === id);

    if (index !== -1) {
        events[index] = { ...events[index], ...data };
        if (typeof window !== "undefined") {
            localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
        }
    }
}

export function deleteEvent(id: string): void {
    const events = getEvents();
    const filtered = events.filter(e => e.id !== id);

    if (typeof window !== "undefined") {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(filtered));
    }
}

// ==================== Settings ====================

export function getSettings(): Settings {
    if (typeof window === "undefined") return { partnerName: "パートナー" };
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : { partnerName: "パートナー" };
}

export function updateSettings(settings: Settings): void {
    if (typeof window !== "undefined") {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
}

// ==================== 統合クエリ ====================

export function getAllRecords(): (Preference | Quote)[] {
    const preferences = getPreferences();
    const quotes = getQuotes();
    const all = [...preferences, ...quotes];
    return all.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function getRecentRecords(limit: number = 5): (Preference | Quote)[] {
    return getAllRecords().slice(0, limit);
}

export function getRecordsByCategory(
    category: RecordCategory
): (Preference | Quote)[] {
    if (category === "quote") {
        return getQuotes();
    }
    return getPreferences().filter((p) => p.category === category);
}

export function searchRecords(query: string): (Preference | Quote)[] {
    const lowerQuery = query.toLowerCase();
    const all = getAllRecords();
    return all.filter((record) => {
        const content = record.content.toLowerCase();
        const tags = record.tags?.join(" ").toLowerCase() || "";
        return content.includes(lowerQuery) || tags.includes(lowerQuery);
    });
}

export function getTotalRecordsCount(): number {
    return getPreferences().length + getQuotes().length;
}

export function getCategoryCount(category: RecordCategory): number {
    return getRecordsByCategory(category).length;
}

export function getMonthlyRecordsCount(): number {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const all = getAllRecords();
    return all.filter(r => new Date(r.createdAt) >= startOfMonth).length;
}

export function getConsecutiveDays(): number {
    const all = getAllRecords();
    if (all.length === 0) return 0;

    const dates = all.map(r => r.createdAt.split("T")[0]);
    const uniqueDates = [...new Set(dates)].sort().reverse();

    if (uniqueDates.length === 0) return 0;

    const today = new Date().toISOString().split("T")[0];
    let consecutive = 0;
    let checkDate = new Date(today);

    for (let i = 0; i < 365; i++) {
        const dateStr = checkDate.toISOString().split("T")[0];
        if (uniqueDates.includes(dateStr)) {
            consecutive++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else if (i === 0) {
            // 今日は記録がなくても連続にカウントしない
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return consecutive;
}

// ==================== データエクスポート/インポート ====================

export interface ExportData {
    preferences: Preference[];
    quotes: Quote[];
    events: Event[];
    settings: Settings;
    exportedAt: string;
}

export function exportAllData(): ExportData {
    return {
        preferences: getPreferences(),
        quotes: getQuotes(),
        events: getEvents(),
        settings: getSettings(),
        exportedAt: new Date().toISOString(),
    };
}

export function importData(data: ExportData): boolean {
    try {
        if (typeof window === "undefined") return false;

        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(data.preferences));
        localStorage.setItem(QUOTES_KEY, JSON.stringify(data.quotes));
        localStorage.setItem(EVENTS_KEY, JSON.stringify(data.events));
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));

        return true;
    } catch (error) {
        console.error("Import failed:", error);
        return false;
    }
}
