const envUrl = process.env.NEXT_PUBLIC_API_URL;
const isServer = typeof window === 'undefined';
import { safeLocalStorage } from '@/lib/storage';

// Prioritize local environment variable if available, fallback to production VPS URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.sparkbluediamond.com/api';

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

    // 3. Optional cache-busting (only if specifically requested or for Client GETs without revalidate)
    const isGet = !options.method || options.method.toUpperCase() === 'GET';
    const hasRevalidate = (options as any)?.next?.revalidate !== undefined;

    if (!isServer && isGet && !hasRevalidate) {
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
                console.log(`[SBD-API] Requesting: ${fullUrl}`);
            }

            // Get token from storage (Client only)
            const token = !isServer ? safeLocalStorage.getItem('token') : null;

            const headers: Record<string, string> = {
                ...((options.headers as Record<string, string>) || {}),
                'X-Client-Version': '1.0.3',
            };

            // Only add no-cache headers for client-side (browser) requests
            if (!isServer) {
                headers['Cache-Control'] = 'no-cache';
                headers['Pragma'] = 'no-cache';
            }

            if (!(options.body instanceof FormData)) {
                headers['Content-Type'] = 'application/json';
            }

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // Use the provided options, but ensure 'no-store' isn't forced if we want revalidation
            const fetchOptions: RequestInit = {
                ...options,
                headers,
            };

            // Instead of forcing no-store (which breaks static rendering), default to a reasonable 5-min cache if unspecified
            if (!hasRevalidate && isServer) {
                fetchOptions.next = { ...fetchOptions.next, revalidate: 300 };
            }

            const res = await fetch(fullUrl, fetchOptions);

            if (!res.ok) {
                if (res.status === 401 && typeof window !== 'undefined') {
                    console.error('[API] Unauthorized - Clearing session...');
                    safeLocalStorage.removeItem('token');
                    safeLocalStorage.removeItem('user');
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

// Reusable utility to normalize image paths (handles relative paths returned by the CMS)
export const normalizeImageUrl = (url: string | undefined | null, fallback = '/default-jewel.jpg'): string => {
    let finalFallback = fallback;
    if (finalFallback && finalFallback.includes('res.cloudinary.com')) {
        finalFallback = '/default-jewel.jpg';
    }

    if (!url) return finalFallback;

    // Cloudinary is deactivated, fallback to local placeholder for legacy images
    if (url.includes('res.cloudinary.com')) {
        return finalFallback;
    }

    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/uploads')) return `${API_URL.replace('/api', '')}${url}`;
    return url;
};
