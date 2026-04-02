import type { Request } from 'express';
import type { AuthRequestContext } from '../interfaces/auth-request-context.interface';

export const getAuthRequestContext = (request: Request): AuthRequestContext => {
  const forwardedFor = request.headers['x-forwarded-for'];
  const ipAddress =
    typeof forwardedFor === 'string'
      ? (forwardedFor.split(',')[0]?.trim() ?? null)
      : (request.ip ?? request.socket.remoteAddress ?? null);

  const userAgentHeader = request.headers['user-agent'];

  return {
    ipAddress,
    userAgent: typeof userAgentHeader === 'string' ? userAgentHeader : null,
  };
};
