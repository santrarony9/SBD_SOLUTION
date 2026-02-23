
const envUrl = process.env.NEXT_PUBLIC_API_URL;
const isServer = typeof window === 'undefined';

export const API_URL = isServer
    ? (process.env.INTERNAL_API_URL || 'https://spark-blue-backend.onrender.com/api')
    : '/external-api';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    // Determine the full URL
    const fullUrl = endpoint.startsWith('http')
        ? endpoint
        : `${API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    // Get token from storage (Client only)
    const token = !isServer ? localStorage.getItem('token') : null;

    const headers: Record<string, string> = {
        ...((options.headers as Record<string, string>) || {}),
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

        let errorMessage = `API Error: ${res.status} ${res.statusText}`;
        try {
            const errorData = await res.json();
            // NestJS usually sends { message: '...', statusCode: ... }
            if (errorData.message) {
                errorMessage = Array.isArray(errorData.message)
                    ? errorData.message.join(', ')
                    : errorData.message;
            }
        } catch (e) {
            // Failure to parse JSON means it's likely a raw server error (e.g. timeout)
            console.error('Could not parse API error response', e);
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
}
