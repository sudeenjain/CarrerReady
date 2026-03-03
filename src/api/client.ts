export type ApiErrorShape = {
  detail?: string;
};

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000") as string;

export function getApiBase() {
  return API_BASE.replace(/\/$/, "");
}

export function getAccessToken(): string | null {
  return localStorage.getItem("cr_access_token");
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("cr_access_token", accessToken);
  localStorage.setItem("cr_refresh_token", refreshToken);
}

export function clearTokens() {
  localStorage.removeItem("cr_access_token");
  localStorage.removeItem("cr_refresh_token");
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", headers.get("Content-Type") || "application/json");

  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${getApiBase()}${path}`, { ...init, headers });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = (await res.json()) as ApiErrorShape;
      if (data?.detail) msg = data.detail;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function apiUpload<T>(path: string, form: FormData): Promise<T> {
  const headers = new Headers();
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${getApiBase()}${path}`, {
    method: "POST",
    headers,
    body: form,
  });
  if (!res.ok) {
    let msg = `Upload failed (${res.status})`;
    try {
      const data = (await res.json()) as ApiErrorShape;
      if (data?.detail) msg = data.detail;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

