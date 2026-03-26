class ApiClient {
  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  get<T>(url: string, params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T>(url + qs);
  }

  post<T>(url: string, body: unknown) {
    return this.request<T>(url, { method: 'POST', body: JSON.stringify(body) });
  }

  patch<T>(url: string, body: unknown) {
    return this.request<T>(url, { method: 'PATCH', body: JSON.stringify(body) });
  }

  delete<T>(url: string) {
    return this.request<T>(url, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
