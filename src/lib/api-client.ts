const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const TOKEN_KEY = "financa:token";

export type ApiErrorBody = {
  timestamp?: string;
  status?: number;
  erro?: string;
  mensagem?: string;
  path?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: ApiErrorBody,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const tokenStorage = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  set(token: string): void {
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  },
};

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  authenticated?: boolean;
  silentError?: boolean;
};

function notifyError(message: string): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("financa:api-error", { detail: message }));
  }
}

async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  if (!API_URL) {
    const message = "A URL da API não está configurada.";
    if (!options.silentError) notifyError(message);
    throw new ApiError(message, 0);
  }

  const { body, authenticated = true, silentError = false, headers, ...requestInit } = options;
  const token = tokenStorage.get();
  const requestHeaders = new Headers(headers);

  requestHeaders.set("Accept", "application/json");
  if (body !== undefined) requestHeaders.set("Content-Type", "application/json");
  if (authenticated && token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...requestInit,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    const message = "Não foi possível conectar à API. Verifique sua conexão e a configuração de CORS.";
    if (!silentError) notifyError(message);
    throw new ApiError(message, 0);
  }

  const responseBody = response.status === 204
    ? undefined
    : await response.json().catch(() => undefined) as ApiErrorBody | T | undefined;

  if (!response.ok) {
    const errorBody = responseBody as ApiErrorBody | undefined;

    if (response.status === 401 && authenticated) {
      tokenStorage.clear();
      if (typeof window !== "undefined") window.location.assign("/login");
    }

    const message = errorBody?.mensagem ?? "Ocorreu um erro ao processar a solicitação.";
    if (!silentError && response.status !== 401) notifyError(message);
    throw new ApiError(message, response.status, errorBody);
  }

  return responseBody as T;
}

export const apiClient = {
  get: <T>(path: string, options?: ApiRequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: ApiRequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
