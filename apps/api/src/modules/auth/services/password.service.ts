import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { AppConfigService } from '../../../core/config/app-config.service';

@Injectable()
export class PasswordService {
  constructor(private readonly appConfig: AppConfigService) {}

  hashPassword(plainPassword: string): Promise<string> {
    return hash(plainPassword, this.appConfig.passwordHashSaltRounds);
  }

  verifyPassword(
    plainPassword: string,
    passwordHash: string,
  ): Promise<boolean> {
    return compare(plainPassword, passwordHash);
  }

  hashRefreshToken(refreshToken: string): Promise<string> {
    return hash(refreshToken, this.appConfig.passwordHashSaltRounds);
  }

  verifyRefreshToken(
    refreshToken: string,
    refreshTokenHash: string,
  ): Promise<boolean> {
    return compare(refreshToken, refreshTokenHash);
  }
}
