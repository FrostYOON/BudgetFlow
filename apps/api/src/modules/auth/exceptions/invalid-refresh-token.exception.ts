import { UnauthorizedException } from '@nestjs/common';

export class InvalidRefreshTokenException extends UnauthorizedException {
  constructor() {
    super({
      code: 'AUTH_INVALID_REFRESH_TOKEN',
      message: 'Refresh token is invalid.',
    });
  }
}
