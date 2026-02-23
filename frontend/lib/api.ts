
const envUrl = process.env.NEXT_PUBLIC_API_URL;
const isServer = typeof window === 'undefined';

export const API_URL = isServer
    ? (process.env.INTERNAL_API_URL || 'https://spark-blue-backend.onrender.com/api')
    : '/external-api';

// In-memory request deduplication to prevent 429 bursts
const pendingRequests = new Map<string, Promise<any>>();

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    // 1. Determine the full URL
    let fullUrl = endpoint.startsWith('http')
        ? endpoint
        : `${API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    // 2. Add stable minute-level cache-busting for GET requests
    // This allows browser/CDN caching for 60s while still preventing permanent stale states.
    if (!isServer && (!options.method || options.method.toUpperCase() === 'GET')) {
        const minuteTimestamp = Math.floor(Date.now() / 60000);
        const separator = fullUrl.includes('?') ? '&' : '?';
        fullUrl = `${fullUrl}${separator}_t=${minuteTimestamp}`;
    }

    // 3. Request Deduplication: If already fetching this URL with same method/body, return existing promise
    const dedupeKey = `${options.method || 'GET'}:${fullUrl}:${options.body ? JSON.stringify(options.body) : ''}`;
    if (!isServer && pendingRequests.has(dedupeKey)) {
        return pendingRequests.get(dedupeKey);
    }

    const requestPromise = (async () => {
        try {
            if (!isServer && process.env.NODE_ENV === 'development') {
                console.log(`[API] Fetching: ${fullUrl}`);
            }

            // Get token from storage (Client only)
            const token = !isServer ? localStorage.getItem('token') : null;

            const headers: Record<string, string> = {
                ...((options.headers as Record<string, string>) || {}),
                'X-Client-Version': '1.0.1',
            };

            if (!(options.body instanceof FormData)) {
                headers['Content-Type'] = 'application/json';
            }

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(fullUrl, {
                ...options,
                cache: 'no-store',
                headers,
            });

            /*
            if (typeof window !== 'undefined' && API_URL.includes('localhost')) {
                console.warn(`[API DEBUG] Hitting local API: ${API_URL}${endpoint}. If you are on Vercel, this is likely wrong!`);
            }
            */

            if (!res.ok) {
                if (res.status === 401 && typeof window !== 'undefined') {
                    console.error('[API] Unauthorized - Clearing session...');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    // Force reload to trigger AuthContext update and redirect to login
                    window.location.href = '/login?error=session_expired';
                    return;
                }

                if (res.status === 429) {
                    throw new Error(`Too many requests. Please wait a minute before trying again.`);
                }

                let errorMessage = `API Error: ${res.status} ${res.statusText} (${fullUrl})`;
                try {
                    const errorText = await res.text();
                    const errorData = errorText ? JSON.parse(errorText) : {};
                    if (errorData.message) {
                        errorMessage = Array.isArray(errorData.message)
                            ? errorData.message.join(', ')
                            : errorData.message;
                    }
                } catch (e) {
                    // Ignore parsing error
                }
                throw new Error(errorMessage);
            }

            const text = await res.text();
            try {
                return text ? JSON.parse(text) : {};
            } catch (e) {
                console.error('Failed to parse successful response JSON', e);
                return {};
            }
        } finally {
            // Always cleanup the dedupe map so next request can proceed
            pendingRequests.delete(dedupeKey);
        }
    })();

    pendingRequests.set(dedupeKey, requestPromise);
    return requestPromise;
}
