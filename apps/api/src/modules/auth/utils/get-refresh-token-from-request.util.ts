import type { Request } from 'express';

const parseCookieHeader = (cookieHeader: string): Record<string, string> => {
  return cookieHeader
    .split(';')
    .map((pair) => pair.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((accumulator, pair) => {
      const [name, ...valueParts] = pair.split('=');

      if (!name) {
        return accumulator;
      }

      accumulator[name] = decodeURIComponent(valueParts.join('='));
      return accumulator;
    }, {});
};

export const getRefreshTokenFromRequest = (
  request: Request,
  cookieName: string,
): string | null => {
  const cookieHeader = request.headers.cookie;

  if (typeof cookieHeader === 'string' && cookieHeader.length > 0) {
    const cookies = parseCookieHeader(cookieHeader);
    const refreshTokenFromCookie = cookies[cookieName];

    if (typeof refreshTokenFromCookie === 'string' && refreshTokenFromCookie) {
      return refreshTokenFromCookie;
    }
  }

  const body = request.body as unknown;

  if (!body || typeof body !== 'object' || !('refreshToken' in body)) {
    return null;
  }

  const refreshToken = body.refreshToken;

  return typeof refreshToken === 'string' && refreshToken.length > 0
    ? refreshToken
    : null;
};
