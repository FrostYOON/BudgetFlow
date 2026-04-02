import "server-only";
import type { AuthUser, WorkspaceSummary } from "@/lib/auth/types";

interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

interface AuthApiResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

function getApiBaseUrl() {
  return process.env.BUDGETFLOW_API_URL ?? "http://localhost:3000/api/v1";
}

function normalizeSetCookieHeaders(headers: Headers): string[] {
  const getSetCookie = (headers as Headers & { getSetCookie?: () => string[] })
    .getSetCookie;

  if (typeof getSetCookie === "function") {
    return getSetCookie.call(headers);
  }

  const raw = headers.get("set-cookie");
  return raw ? [raw] : [];
}

function extractCookieValue(setCookieHeaders: string[], cookieName: string) {
  for (const header of setCookieHeaders) {
    const match = header.match(new RegExp(`${cookieName}=([^;]+)`));

    if (match) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
}

async function parseAuthResponse(
  response: Response,
  refreshCookieName: string,
) {
  const body = (await response.json()) as AuthApiResponse & {
    message?: string;
    code?: string;
  };

  if (!response.ok) {
    throw new Error(body.message ?? "Authentication request failed.");
  }

  const refreshToken =
    body.tokens.refreshToken ??
    extractCookieValue(
      normalizeSetCookieHeaders(response.headers),
      refreshCookieName,
    ) ??
    undefined;

  return {
    user: body.user,
    accessToken: body.tokens.accessToken,
    refreshToken,
  };
}

export function decodeJwtExp(token: string): number | null {
  const parts = token.split(".");

  if (parts.length < 2) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8"),
    ) as { exp?: number };

    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export async function signInWithApi(input: {
  email: string;
  password: string;
  refreshCookieName: string;
}) {
  const response = await fetch(`${getApiBaseUrl()}/auth/sign-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      email: input.email,
      password: input.password,
    }),
  });

  return parseAuthResponse(response, input.refreshCookieName);
}

export async function signUpWithApi(input: {
  name: string;
  email: string;
  password: string;
  locale?: string;
  timezone?: string;
  refreshCookieName: string;
}) {
  const response = await fetch(`${getApiBaseUrl()}/auth/sign-up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      password: input.password,
      locale: input.locale,
      timezone: input.timezone,
    }),
  });

  return parseAuthResponse(response, input.refreshCookieName);
}

export async function signInWithGoogleCodeApi(input: {
  code: string;
  redirectUri: string;
  refreshCookieName: string;
}) {
  const response = await fetch(`${getApiBaseUrl()}/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      code: input.code,
      redirectUri: input.redirectUri,
    }),
  });

  return parseAuthResponse(response, input.refreshCookieName);
}

export async function refreshWithApi(input: {
  refreshToken: string;
  refreshCookieName: string;
}) {
  const response = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      refreshToken: input.refreshToken,
    }),
  });

  return parseAuthResponse(response, input.refreshCookieName);
}

export async function fetchMe(accessToken: string) {
  const response = await fetch(`${getApiBaseUrl()}/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as AuthUser;
}

export async function fetchWorkspaces(accessToken: string) {
  const response = await fetch(`${getApiBaseUrl()}/workspaces`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  return (await response.json()) as WorkspaceSummary[];
}

export async function signOutFromApi(accessToken: string) {
  await fetch(`${getApiBaseUrl()}/auth/sign-out`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  }).catch(() => undefined);
}
