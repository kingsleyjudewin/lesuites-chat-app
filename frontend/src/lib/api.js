const BASE = import.meta.env.VITE_API_URL;

let accessToken = null;
let onAuthLost = () => {};

export function setAccessToken(token) {
  accessToken = token;
}

export function setOnAuthLost(handler) {
  onAuthLost = handler;
}

class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function raw(method, path, body) {
  const headers = { 'content-type': 'application/json' };
  if (accessToken) headers.authorization = `Bearer ${accessToken}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* empty body */
  }
  return { res, json };
}

// Refresh tokens rotate on every use, so two concurrent calls (React StrictMode's double-effect,
// or just two components hitting a 401 at once) would have the second present an already-rotated
// cookie — which the backend correctly treats as theft and revokes the whole session for. Sharing
// one in-flight promise keeps concurrent callers on the same, single, successful rotation.
let refreshInFlight = null;

async function refreshAccessToken() {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const { res, json } = await raw('POST', '/auth/refresh');
    if (!res.ok) return null;
    accessToken = json.data.accessToken;
    return accessToken;
  })();
  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

async function request(method, path, body) {
  let { res, json } = await raw(method, path, body);

  // A 401 on anything other than the auth endpoints themselves is worth one silent refresh-and-retry.
  if (res.status === 401 && !path.startsWith('/auth/')) {
    const refreshed = await refreshAccessToken();
