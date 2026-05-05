const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function getToken(): string | null {
  return localStorage.getItem('auth_token')
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init.headers ?? {}) },
  })

  if (res.status === 401) {
    localStorage.removeItem('auth_token')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.detail ?? data?.error ?? 'Request failed')
  }
  return data as T
}

export const apiClient = {
  get<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'GET' })
  },
  post<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
  },
  put<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: 'PUT', body: JSON.stringify(body) })
  },
  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' })
  },
}
