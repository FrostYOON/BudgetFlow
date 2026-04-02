import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../../../core/config/app-config.service';
import { AuthTokensDto } from '../dto/auth-tokens.dto';

interface TokenSubject {
  userId: string;
  email: string;
  sessionId: string;
}

export interface IssuedAuthTokens extends AuthTokensDto {
  refreshToken: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly appConfig: AppConfigService,
  ) {}

  createAccessToken(subject: TokenSubject): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: subject.userId,
        email: subject.email,
        sessionId: subject.sessionId,
        tokenType: 'access',
      },
      {
        secret: this.appConfig.jwtAccessSecret,
        expiresIn: this.appConfig.jwtAccessExpiresInSeconds,
      },
    );
  }

  createRefreshToken(subject: TokenSubject): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: subject.userId,
        email: subject.email,
        sessionId: subject.sessionId,
        tokenType: 'refresh',
      },
      {
        secret: this.appConfig.jwtRefreshSecret,
        expiresIn: this.appConfig.jwtRefreshExpiresInSeconds,
      },
    );
  }

  async createAuthTokens(subject: TokenSubject): Promise<IssuedAuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(subject),
      this.createRefreshToken(subject),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  buildRefreshTokenExpiresAt(now: Date = new Date()): Date {
    return new Date(
      now.getTime() + this.appConfig.jwtRefreshExpiresInSeconds * 1000,
    );
  }
}
