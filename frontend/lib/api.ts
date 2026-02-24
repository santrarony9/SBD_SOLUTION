
const envUrl = process.env.NEXT_PUBLIC_API_URL;
const isServer = typeof window === 'undefined';

export const API_URL = isServer
    ? (process.env.INTERNAL_API_URL || 'https://api.sparkbluediamond.com/api')
    : (process.env.NEXT_PUBLIC_API_URL || 'https://api.sparkbluediamond.com/api');

// In-memory request deduplication to prevent 429 bursts
const pendingRequests = new Map<string, Promise<any>>();
let global429Cooldown: number = 0;

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    // 1. Safety Check: If we are in a 429 cooldown, wait or fail early
    if (!isServer && Date.now() < global429Cooldown) {
        const remaining = Math.ceil((global429Cooldown - Date.now()) / 1000);
        throw new Error(`System cooling down due to rate limits. Please wait ${remaining}s.`);
    }

    // 2. Determine the full URL
    let fullUrl = endpoint.startsWith('http')
        ? endpoint
        : `${API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    // 3. Add stable minute-level cache-busting for GET requests
    // Using '_v' for v1.0.3 to ensure we bypass any stale cache of previous '_cb' or '_t'
    if (!isServer && (!options.method || options.method.toUpperCase() === 'GET')) {
        const minuteTimestamp = Math.floor(Date.now() / 60000);
        const separator = fullUrl.includes('?') ? '&' : '?';
        fullUrl = `${fullUrl}${separator}_v=${minuteTimestamp}`;
    }

    // 4. Request Deduplication: If already fetching this URL with same method/body, return existing promise
    const dedupeKey = `${options.method || 'GET'}:${fullUrl}:${options.body ? JSON.stringify(options.body) : ''}`;
    if (!isServer && pendingRequests.has(dedupeKey)) {
        return pendingRequests.get(dedupeKey);
    }

    const requestPromise = (async () => {
        try {
            if (!isServer) {
                console.log(`[SBD-API] Requesting (v1.0.3): ${fullUrl}`);
            }

            // Get token from storage (Client only)
            const token = !isServer ? localStorage.getItem('token') : null;

            const headers: Record<string, string> = {
                ...((options.headers as Record<string, string>) || {}),
                'X-Client-Version': '1.0.2',
                'Cache-Control': 'no-cache', // Signal to proxies not to cache
                'Pragma': 'no-cache'
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

            if (!res.ok) {
                if (res.status === 401 && typeof window !== 'undefined') {
                    console.error('[API] Unauthorized - Clearing session...');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login?error=session_expired';
                    return;
                }

                if (res.status === 429) {
                    // Set a 5-second global cooldown to prevent immediate retries
                    if (!isServer) {
                        global429Cooldown = Date.now() + 5000;
                    }
                    throw new Error(`Too many requests. System is cooling down for 5 seconds.`);
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
            // Always cleanup the dedupe map
            pendingRequests.delete(dedupeKey);
        }
    })();

    if (!isServer) {
        pendingRequests.set(dedupeKey, requestPromise);
    }

    return requestPromise;
}
