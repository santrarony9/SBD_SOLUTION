
const envUrl = process.env.NEXT_PUBLIC_API_URL;
export const API_URL = envUrl
    ? (envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`)
    : '/api';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    // Get token from storage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers: Record<string, string> = {
        ...((options.headers as Record<string, string>) || {}),
    };

    // Only set Content-Type to JSON if the body is NOT FormData
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        cache: 'no-store', // Disable caching to prevent stale data
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
