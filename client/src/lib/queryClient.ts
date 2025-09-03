import { QueryClient, QueryFunction } from "@tanstack/react-query";

type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Parsing error response dari server untuk mendapatkan pesan yang lebih informatif
 */
async function parseErrorResponse(res: Response): Promise<string> {
  let errorMessage = `${res.status}: ${res.statusText}`;

  try {
    const contentType = res.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } else {
      const errorText = await res.text();
      // Deteksi kalau responsenya HTML (misalnya error page)
      if (errorText.includes("<!DOCTYPE") || errorText.includes("<html>")) {
        errorMessage = "Server error occurred. Please try again.";
      } else {
        errorMessage = errorText || errorMessage;
      }
    }
  } catch {
    errorMessage = "Network error or server unavailable";
  }

  return errorMessage;
}

/**
 * apiRequest
 * - Mendukung semua opsi bawaan fetch (RequestInit)
 * - Otomatis parse JSON bila tersedia
 * - Menangani error dengan pesan yang lebih jelas
 * - Meng-include cookie/session secara default
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  let finalBody: BodyInit | undefined = undefined;

  if (options.body !== undefined) {
    if (typeof options.body === "object" && !(options.body instanceof FormData)) {
      finalBody = JSON.stringify(options.body);
    } else {
      finalBody = options.body as BodyInit;
    }
  }

  const res = await fetch(url, {
    credentials: "include", // penting untuk request yang butuh session
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
    body: finalBody,
  });

  // Khusus endpoint /auth/user → return null di 401
  if (res.status === 401 && url.includes("/auth/user")) {
    return null as T;
  }

  // Kalau status HTTP tidak OK → lempar error
  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  // Cek apakah ada konten JSON
  const contentLength = res.headers.get("content-length");
  const contentType = res.headers.get("content-type");

  if (!contentLength || contentLength === "0" || !contentType?.includes("application/json")) {
    return {} as T;
  }

  try {
    return (await res.json()) as T;
  } catch {
    return {} as T;
  }
}

/**
 * query function generator untuk react-query
 */
export const getQueryFn =
  <T>({ on401 }: { on401: UnauthorizedBehavior }): QueryFunction<T> =>
  async ({ queryKey }) => {
    // Pastikan queryKey adalah array string
    const url = Array.isArray(queryKey) ? queryKey.join("/") : String(queryKey);

    try {
      return await apiRequest<T>(url);
    } catch (error) {
      if (
        on401 === "returnNull" &&
        error instanceof Error &&
        error.message.includes("401")
      ) {
        return null as T;
      }
      throw error;
    }
  };

/**
 * Default query client untuk aplikasi
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
