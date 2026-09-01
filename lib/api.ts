// Thin fetch wrapper around the backend, proxied through /api/* (see
// next.config.js). Error shapes here are read directly from
// GlobalExceptionHandler.java in the backend repo, not guessed:
//   - DuplicateResourceException / ResourceNotFoundException /
//     ProductNotAvailableException / InvalidOrderTransitionException /
//     BadCredentialsException  ->  { "error": "message" }
//   - MethodArgumentNotValidException (bean validation) -> a flat map of
//     { fieldName: "message" }, with NO "error" wrapper key.

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function parseErrorBody(res: Response): Promise<ApiError> {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // no JSON body at all
  }

  if (body && typeof body === 'object') {
    const record = body as Record<string, string>;
    if (typeof record.error === 'string') {
      return new ApiError(res.status, record.error);
    }
    // Otherwise treat it as a field-validation map.
    const messages = Object.values(record);
    const summary = messages.length > 0 ? messages.join(' ') : `Request failed (${res.status})`;
    return new ApiError(res.status, summary, record);
  }

  return new ApiError(res.status, `Request failed (${res.status})`);
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isFormData = init.body instanceof FormData;

  const res = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: isFormData
      ? init.headers
      : {
          'Content-Type': 'application/json',
          ...(init.headers || {}),
        },
  });

  if (!res.ok) {
    throw await parseErrorBody(res);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
  postForm: <T>(path: string, form: FormData) => apiFetch<T>(path, { method: 'POST', body: form }),
};
