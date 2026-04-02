import { UnauthorizedException } from '@nestjs/common';

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super({
      code: 'AUTH_INVALID_CREDENTIALS',
      message: 'Email or password is invalid.',
    });
  }
}
