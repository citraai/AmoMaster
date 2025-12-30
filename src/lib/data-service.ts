/**
 * Data Service - Client-side API calls
 */

// 汎用フェッチ関数
async function fetchApi(url: string, options?: RequestInit) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
}

// ==================== Preferences ====================

export async function getPreferences() {
    return fetchApi("/api/data?type=preferences");
}

export async function createPreference(data: {
    category: string;
    content: string;
    tags?: string[];
}) {
    return fetchApi("/api/data", {
        method: "POST",
        body: JSON.stringify({ type: "preference", data }),
    });
}

export async function deletePreference(id: string) {
    return fetchApi(`/api/data?type=preference&id=${id}`, {
        method: "DELETE",
    });
}

export async function updatePreference(id: string, data: {
    content?: string;
    tags?: string[];
}) {
    return fetchApi("/api/data", {
        method: "PUT",
        body: JSON.stringify({ type: "preference", id, data }),
    });
}

// ==================== Quotes ====================

export async function getQuotes() {
    return fetchApi("/api/data?type=quotes");
}

export async function createQuote(data: {
    content: string;
    context?: string;
    tags?: string[];
}) {
    return fetchApi("/api/data", {
        method: "POST",
        body: JSON.stringify({ type: "quote", data }),
    });
}

export async function deleteQuote(id: string) {
    return fetchApi(`/api/data?type=quote&id=${id}`, {
        method: "DELETE",
    });
}

export async function updateQuote(id: string, data: {
    content?: string;
    context?: string;
    tags?: string[];
}) {
    return fetchApi("/api/data", {
        method: "PUT",
        body: JSON.stringify({ type: "quote", id, data }),
    });
}

// ==================== Events ====================

export async function getEvents() {
    return fetchApi("/api/data?type=events");
}

export async function createEvent(data: {
    type: string;
    title: string;
    date: string;
    isRecurring?: boolean;
    notes?: string;
}) {
    return fetchApi("/api/data", {
        method: "POST",
        body: JSON.stringify({ type: "event", data }),
    });
}

export async function deleteEvent(id: string) {
    return fetchApi(`/api/data?type=event&id=${id}`, {
        method: "DELETE",
    });
}

// ==================== Settings ====================

export async function getSettings() {
    return fetchApi("/api/data?type=settings");
}

export async function updateSettings(data: {
    partnerName?: string;
    partnerNickname?: string;
    startDate?: string;
}) {
    return fetchApi("/api/data", {
        method: "POST",
        body: JSON.stringify({ type: "settings", data }),
    });
}

// ==================== User Progress ====================

export async function getUserProgress() {
    return fetchApi("/api/data?type=progress");
}

export async function updateUserProgress(data: {
    xp: number;
    totalCompleted: number;
    lastMissionDate: string;
    completedMissions: string[];
}) {
    return fetchApi("/api/data", {
        method: "POST",
        body: JSON.stringify({ type: "progress", data }),
    });
}

// ==================== User Profile ====================

export async function getUserProfile() {
    return fetchApi("/api/data?type=profile");
}

export async function updateUserProfile(data: {
    gender?: string;
    genderCustom?: string;
    partnerPronoun?: string;
}) {
    return fetchApi("/api/data", {
        method: "POST",
        body: JSON.stringify({ type: "profile", data }),
    });
}

// ==================== All Data ====================

export async function getAllData() {
    return fetchApi("/api/data?type=all");
}

// ==================== Account Deletion ====================

export async function deleteAccount(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        const response = await fetch("/api/account/delete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.error || "削除に失敗しました" };
        }

        return { success: true, message: data.message };
    } catch (error) {
        console.error("[deleteAccount] Error:", error);
        return { success: false, error: "ネットワークエラーが発生しました" };
    }
}
