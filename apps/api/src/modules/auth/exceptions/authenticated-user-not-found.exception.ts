import { UnauthorizedException } from '@nestjs/common';

export class AuthenticatedUserNotFoundException extends UnauthorizedException {
  constructor() {
    super({
      code: 'AUTHENTICATED_USER_NOT_FOUND',
      message: 'Authenticated user was not found.',
    });
  }
}
