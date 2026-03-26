import { Injectable } from '@nestjs/common';
import type { Response } from 'express';
import { AppConfigService } from '../../../core/config/app-config.service';
import { AuthResponseDto } from '../dto/auth-response.dto';

@Injectable()
export class AuthCookieService {
  constructor(private readonly appConfig: AppConfigService) {}

  setRefreshTokenCookie(response: Response, refreshToken: string): void {
    response.cookie(this.appConfig.authRefreshCookieName, refreshToken, {
      httpOnly: true,
      secure: this.appConfig.authRefreshCookieSecure,
      sameSite: this.appConfig.authRefreshCookieSameSite,
      domain: this.appConfig.authRefreshCookieDomain,
      path: `/${this.appConfig.apiPrefix}/auth`,
      maxAge: this.appConfig.jwtRefreshExpiresInSeconds * 1000,
    });
  }

  clearRefreshTokenCookie(response: Response): void {
    response.clearCookie(this.appConfig.authRefreshCookieName, {
      httpOnly: true,
      secure: this.appConfig.authRefreshCookieSecure,
      sameSite: this.appConfig.authRefreshCookieSameSite,
      domain: this.appConfig.authRefreshCookieDomain,
      path: `/${this.appConfig.apiPrefix}/auth`,
    });
  }

  toClientResponse(authResponse: AuthResponseDto): AuthResponseDto {
    if (this.appConfig.authExposeRefreshTokenInResponse) {
      return authResponse;
    }

    return {
      user: authResponse.user,
      tokens: {
        accessToken: authResponse.tokens.accessToken,
      },
    };
  }
}
