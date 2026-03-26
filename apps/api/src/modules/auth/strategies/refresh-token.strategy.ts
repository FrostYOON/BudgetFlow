import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { AppConfigService } from '../../../core/config/app-config.service';
import { InvalidRefreshTokenException } from '../exceptions/invalid-refresh-token.exception';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { getRefreshTokenFromRequest } from '../utils/get-refresh-token-from-request.util';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly appConfig: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) =>
          getRefreshTokenFromRequest(request, appConfig.authRefreshCookieName),
      ]),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: appConfig.jwtRefreshSecret,
    });
  }

  validate(request: Request, payload: JwtPayload) {
    if (payload.tokenType !== 'refresh') {
      throw new InvalidRefreshTokenException();
    }

    const refreshToken = getRefreshTokenFromRequest(
      request,
      this.appConfig.authRefreshCookieName,
    );

    if (!refreshToken) {
      throw new InvalidRefreshTokenException();
    }

    return {
      userId: payload.sub,
      email: payload.email,
      sessionId: payload.sessionId,
      refreshToken,
    };
  }
}
