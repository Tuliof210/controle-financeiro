type ApiResult<T> =
  | { data: T; error?: undefined }
  | { data?: undefined; error: string };

async function request<T>(
  input: string,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(input, init);
    const body = await res.json().catch(() => null);
    return res.ok
      ? { data: body?.data as T }
      : { error: (body?.error?.message as string) ?? "Erro inesperado" };
  } catch {
    return { error: "Erro inesperado" };
  }
}

export const apiGet = <T>(url: string) => request<T>(url);

export const apiPost = <T>(url: string, body: unknown) =>
  request<T>(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

export const apiPut = <T>(url: string, body: unknown) =>
  request<T>(url, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

export const apiDelete = <T>(url: string) =>
  request<T>(url, { method: "DELETE" });

// Multipart, so the content-type header is deliberately absent: the browser
// has to set it itself to carry the boundary. Everything else goes through the
// same request() envelope handling as the JSON helpers — including the fact
// that it never rejects, so callers still check `result.error`.
export const apiUpload = <T>(url: string, file: File) => {
  const body = new FormData();
  body.append("file", file);
  return request<T>(url, { method: "POST", body });
};
