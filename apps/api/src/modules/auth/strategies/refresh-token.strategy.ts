import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { AppConfigService } from '../../../core/config/app-config.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

const getRefreshTokenFromRequest = (request: Request): string | null => {
  const body = request.body as unknown;

  if (!body || typeof body !== 'object' || !('refreshToken' in body)) {
    return null;
  }

  const refreshToken = body.refreshToken;

  return typeof refreshToken === 'string' && refreshToken.length > 0
    ? refreshToken
    : null;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(appConfig: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([getRefreshTokenFromRequest]),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: appConfig.jwtRefreshSecret,
    });
  }

  validate(request: Request, payload: JwtPayload) {
    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Refresh token is invalid.');
    }

    const refreshToken = getRefreshTokenFromRequest(request);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is invalid.');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      refreshToken,
    };
  }
}
