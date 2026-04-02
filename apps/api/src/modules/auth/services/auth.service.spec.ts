import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppLoggerService } from '../../../core/logger/app-logger.service';
import { UsersService } from '../../users/users.service';
import { WorkspacesService } from '../../workspaces/services/workspaces.service';
import { AuthService } from './auth.service';
import { AuthSessionsService } from './auth-sessions.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: {
    create: jest.Mock;
    findByEmail: jest.Mock;
    findById: jest.Mock;
    toResponse: jest.Mock;
  };
  let authSessionsService: {
    createSession: jest.Mock;
    findSessionById: jest.Mock;
    rotateSession: jest.Mock;
    revokeSession: jest.Mock;
  };
  let passwordService: {
    hashPassword: jest.Mock;
    verifyPassword: jest.Mock;
    hashRefreshToken: jest.Mock;
    verifyRefreshToken: jest.Mock;
  };
  let tokenService: {
    createAuthTokens: jest.Mock;
    buildRefreshTokenExpiresAt: jest.Mock;
  };
  let workspacesService: {
    createPersonalWorkspace: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      toResponse: jest.fn(),
    };

    authSessionsService = {
      createSession: jest.fn(),
      findSessionById: jest.fn(),
      rotateSession: jest.fn(),
      revokeSession: jest.fn(),
    };

    passwordService = {
      hashPassword: jest.fn(),
      verifyPassword: jest.fn(),
      hashRefreshToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    tokenService = {
      createAuthTokens: jest.fn(),
      buildRefreshTokenExpiresAt: jest
        .fn()
        .mockReturnValue(new Date('2026-04-24T00:00:00.000Z')),
    };

    workspacesService = {
      createPersonalWorkspace: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: WorkspacesService,
          useValue: workspacesService,
        },
        {
          provide: AuthSessionsService,
          useValue: authSessionsService,
        },
        {
          provide: PasswordService,
          useValue: passwordService,
        },
        {
          provide: TokenService,
          useValue: tokenService,
        },
        {
          provide: AppLoggerService,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('signUp should create a user and issue auth tokens', async () => {
    const createdUser = {
      id: 'user-1',
      email: 'minji@example.com',
      name: 'Minji',
      locale: 'ko-KR',
      timezone: 'Asia/Seoul',
      createdAt: new Date('2026-03-24T00:00:00.000Z'),
    };

    passwordService.hashPassword.mockResolvedValue('password-hash');
    usersService.create.mockResolvedValue(createdUser);
    usersService.findById.mockResolvedValue(createdUser);
    usersService.toResponse.mockReturnValue(createdUser);
    tokenService.createAuthTokens.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    passwordService.hashRefreshToken.mockResolvedValue('refresh-token-hash');

    const result = await authService.signUp(
      {
        email: 'minji@example.com',
        password: 'StrongPassword123!',
        name: 'Minji',
      },
      {
        ipAddress: '127.0.0.1',
        userAgent: 'jest',
      },
    );

    expect(usersService.create).toHaveBeenCalled();
    expect(result.tokens.accessToken).toBe('access-token');
    expect(result.tokens.refreshToken).toBe('refresh-token');
    expect(result.user.email).toBe('minji@example.com');
    expect(authSessionsService.createSession).toHaveBeenCalled();
    expect(workspacesService.createPersonalWorkspace).toHaveBeenCalledWith({
      ownerUserId: 'user-1',
      ownerName: 'Minji',
      locale: 'ko-KR',
      timezone: 'Asia/Seoul',
    });
  });

  it('signIn should throw when password is invalid', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'minji@example.com',
      passwordHash:
        '$2b$10$PEmjTePlL3W0Qm7lvcVnV.RXqEJ10BGSAdoo6gWQBaIjXImQxGc1m',
    });
    passwordService.verifyPassword.mockResolvedValue(false);

    await expect(
      authService.signIn(
        {
          email: 'minji@example.com',
          password: 'wrong-password',
        },
        {
          ipAddress: '127.0.0.1',
          userAgent: 'jest',
        },
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('me should return the authenticated user response', async () => {
    const user = {
      id: 'user-1',
      email: 'minji@example.com',
      name: 'Minji',
      locale: 'ko-KR',
      timezone: 'Asia/Seoul',
      createdAt: new Date('2026-03-24T00:00:00.000Z'),
    };

    usersService.findById.mockResolvedValue(user);
    usersService.toResponse.mockReturnValue(user);

    const result = await authService.me('user-1');

    expect(result.email).toBe('minji@example.com');
    expect(usersService.findById).toHaveBeenCalledWith('user-1');
  });

  it('refresh should rotate tokens when refresh token is valid', async () => {
    const user = {
      id: 'user-1',
      email: 'minji@example.com',
      passwordHash: null,
      refreshTokenHash: 'stored-refresh-token-hash',
      name: 'Minji',
      locale: 'ko-KR',
      timezone: 'Asia/Seoul',
      createdAt: new Date('2026-03-24T00:00:00.000Z'),
    };

    usersService.findById.mockResolvedValue(user);
    authSessionsService.findSessionById.mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      refreshTokenHash: 'stored-refresh-token-hash',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    });
    usersService.toResponse.mockReturnValue(user);
    passwordService.verifyRefreshToken.mockResolvedValue(true);
    tokenService.createAuthTokens.mockResolvedValue({
      accessToken: 'next-access-token',
      refreshToken: 'next-refresh-token',
    });
    passwordService.hashRefreshToken.mockResolvedValue(
      'next-refresh-token-hash',
    );

    const result = await authService.refresh(
      {
        userId: 'user-1',
        email: 'minji@example.com',
        sessionId: 'session-1',
        refreshToken: 'refresh-token',
      },
      {
        ipAddress: '127.0.0.1',
        userAgent: 'jest',
      },
    );

    expect(result.tokens.accessToken).toBe('next-access-token');
    expect(result.tokens.refreshToken).toBe('next-refresh-token');
    expect(authSessionsService.rotateSession).toHaveBeenCalled();
  });

  it('signOut should clear the stored refresh token hash', async () => {
    const result = await authService.signOut({
      userId: 'user-1',
      email: 'minji@example.com',
      sessionId: 'session-1',
    });

    expect(result).toEqual({ signedOut: true });
    expect(authSessionsService.revokeSession).toHaveBeenCalledWith(
      'session-1',
      'user-1',
    );
  });
});
