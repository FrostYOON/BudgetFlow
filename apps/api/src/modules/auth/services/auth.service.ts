import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { AuthenticatedUser } from '../../../common/interfaces/authenticated-request.interface';
import { AppLoggerService } from '../../../core/logger/app-logger.service';
import { UsersService } from '../../users/users.service';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { AuthenticatedUserNotFoundException } from '../exceptions/authenticated-user-not-found.exception';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';
import { InvalidRefreshTokenException } from '../exceptions/invalid-refresh-token.exception';
import type { AuthRequestContext } from '../interfaces/auth-request-context.interface';
import { SignInRequestDto } from '../dto/sign-in-request.dto';
import { SignOutResponseDto } from '../dto/sign-out-response.dto';
import { SignUpRequestDto } from '../dto/sign-up-request.dto';
import { AuthSessionsService } from './auth-sessions.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authSessionsService: AuthSessionsService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly logger: AppLoggerService,
  ) {}

  async signUp(
    input: SignUpRequestDto,
    requestContext: AuthRequestContext,
  ): Promise<AuthResponseDto> {
    const passwordHash = await this.passwordService.hashPassword(
      input.password,
    );

    const user = await this.usersService.create({
      email: input.email,
      passwordHash,
      name: input.name,
    });

    this.logger.log('User created', AuthService.name, {
      userId: user.id,
      email: user.email,
    });

    return this.createAuthResponse(user.id, requestContext);
  }

  async signIn(
    input: SignInRequestDto,
    requestContext: AuthRequestContext,
  ): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(input.email);

    if (!user?.passwordHash) {
      throw new InvalidCredentialsException();
    }

    const passwordMatches = await this.passwordService.verifyPassword(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new InvalidCredentialsException();
    }

    this.logger.log('User signed in', AuthService.name, {
      userId: user.id,
      email: user.email,
    });

    return this.createAuthResponse(user.id, requestContext);
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new AuthenticatedUserNotFoundException();
    }

    return this.usersService.toResponse(user);
  }

  async refresh(
    user: AuthenticatedUser,
    requestContext: AuthRequestContext,
  ): Promise<AuthResponseDto> {
    const existingUser = await this.usersService.findById(user.userId);
    const sessionId = user.sessionId;

    if (!existingUser || !user.refreshToken || !sessionId) {
      throw new InvalidRefreshTokenException();
    }

    const session = await this.authSessionsService.findSessionById(
      sessionId,
      existingUser.id,
    );

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt.getTime() <= Date.now()
    ) {
      throw new InvalidRefreshTokenException();
    }

    const refreshTokenMatches = await this.passwordService.verifyRefreshToken(
      user.refreshToken,
      session.refreshTokenHash,
    );

    if (!refreshTokenMatches) {
      throw new InvalidRefreshTokenException();
    }

    this.logger.log('Auth tokens refreshed', AuthService.name, {
      userId: existingUser.id,
      email: existingUser.email,
      sessionId,
    });

    return this.rotateAuthResponse(existingUser.id, sessionId, requestContext);
  }

  async signOut(user: AuthenticatedUser): Promise<SignOutResponseDto> {
    if (user.sessionId) {
      await this.authSessionsService.revokeSession(user.sessionId, user.userId);
    }

    this.logger.log('User signed out', AuthService.name, {
      userId: user.userId,
      sessionId: user.sessionId,
    });

    return {
      signedOut: true,
    };
  }

  private async createAuthResponse(
    userId: string,
    requestContext: AuthRequestContext,
  ): Promise<AuthResponseDto> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new AuthenticatedUserNotFoundException();
    }

    const sessionId = randomUUID();
    const tokens = await this.tokenService.createAuthTokens({
      userId: user.id,
      email: user.email,
      sessionId,
    });

    const refreshTokenHash = await this.passwordService.hashRefreshToken(
      tokens.refreshToken,
    );
    await this.authSessionsService.createSession({
      sessionId,
      userId: user.id,
      refreshTokenHash,
      expiresAt: this.tokenService.buildRefreshTokenExpiresAt(),
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent,
    });

    return {
      user: this.usersService.toResponse(user),
      tokens,
    };
  }

  private async rotateAuthResponse(
    userId: string,
    sessionId: string,
    requestContext: AuthRequestContext,
  ): Promise<AuthResponseDto> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new AuthenticatedUserNotFoundException();
    }

    const tokens = await this.tokenService.createAuthTokens({
      userId: user.id,
      email: user.email,
      sessionId,
    });

    const refreshTokenHash = await this.passwordService.hashRefreshToken(
      tokens.refreshToken,
    );

    await this.authSessionsService.rotateSession(sessionId, user.id, {
      refreshTokenHash,
      expiresAt: this.tokenService.buildRefreshTokenExpiresAt(),
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent,
    });

    return {
      user: this.usersService.toResponse(user),
      tokens,
    };
  }
}
