
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
    authToken = token;
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as any),
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'API request failed');
    }

    return response.json();
}

export const api = {
    get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
    post: <T>(endpoint: string, body: any) => request<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
    }),
    put: <T>(endpoint: string, body: any) => request<T>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body)
    }),
    delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
