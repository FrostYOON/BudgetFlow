import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../../../core/config/app-config.service';
import { AuthTokensDto } from '../dto/auth-tokens.dto';

interface TokenSubject {
  userId: string;
  email: string;
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
        tokenType: 'refresh',
      },
      {
        secret: this.appConfig.jwtRefreshSecret,
        expiresIn: this.appConfig.jwtRefreshExpiresInSeconds,
      },
    );
  }

  async createAuthTokens(subject: TokenSubject): Promise<AuthTokensDto> {
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(subject),
      this.createRefreshToken(subject),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
