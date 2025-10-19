import { getStoredToken } from "../auth-storage";

export interface ApiClientOptions {
  baseUrl?: string;
  token?: string | null;
}

// Get API base URL - em dev usa proxy do Vite (/api)
const getApiBaseUrl = (): string => {
  // Produção: usa backend do Render
  if (import.meta.env.PROD) {
    return "https://backend-wms-fdsc.onrender.com/api";
  }

  // Desenvolvimento: usar caminho relativo para acionar o proxy do Vite
  return "/api";
};

// Cache for API base URL
let cachedBaseUrl: string | null = null;

const getCachedApiBaseUrl = (): string => {
  if (!cachedBaseUrl) {
    cachedBaseUrl = getApiBaseUrl();
  }
  return cachedBaseUrl;
};

const DEFAULT_BASE = getCachedApiBaseUrl();

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  clientOptions: ApiClientOptions = {}
): Promise<T> {
  const base = clientOptions.baseUrl ?? DEFAULT_BASE;
  const token = clientOptions.token ?? getStoredToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  // Try primary URL first
  try {
    const res = await fetch(`${base}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      // Tratamento especial: se 401, limpar sessão e redirecionar para login
      if (res.status === 401) {
        try {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
        } catch {
          // noop: storage may be unavailable
        }
        // Redirecionar para login mantendo URL de retorno
        if (typeof window !== "undefined") {
          const current = window.location.pathname + window.location.search;
          const redirect = `/login${
            current && current !== "/login"
              ? `?from=${encodeURIComponent(current)}`
              : ""
          }`;
          if (window.location.pathname !== "/login") {
            window.location.replace(redirect);
          }
        }
      }
      const text = await res.text().catch(() => "");
      throw new Error(`API error ${res.status}: ${text || res.statusText}`);
    }
    return res.json() as Promise<T>;
  } catch (error) {
    // TESTE LOCAL: sem fallback, lançar erro direto
    console.error("❌ Erro na API local:", error);
    throw error;
  }
}
