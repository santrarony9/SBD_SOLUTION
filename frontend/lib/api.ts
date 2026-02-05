
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    // Get token from storage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (typeof window !== 'undefined' && API_URL.includes('localhost')) {
        console.warn(`[API DEBUG] Hitting local API: ${API_URL}${endpoint}. If you are on Vercel, this is likely wrong!`);
    }

    if (!res.ok) {
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

    return res.json();
}
