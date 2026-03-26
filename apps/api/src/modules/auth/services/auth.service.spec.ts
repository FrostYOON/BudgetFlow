import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppLoggerService } from '../../../core/logger/app-logger.service';
import { UsersService } from '../../users/users.service';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: {
    create: jest.Mock;
    findByEmail: jest.Mock;
    findById: jest.Mock;
    updateRefreshTokenHash: jest.Mock;
    toResponse: jest.Mock;
  };
  let passwordService: {
    hashPassword: jest.Mock;
    verifyPassword: jest.Mock;
    hashRefreshToken: jest.Mock;
    verifyRefreshToken: jest.Mock;
  };
  let tokenService: {
    createAuthTokens: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      updateRefreshTokenHash: jest.fn(),
      toResponse: jest.fn(),
    };

    passwordService = {
      hashPassword: jest.fn(),
      verifyPassword: jest.fn(),
      hashRefreshToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    tokenService = {
      createAuthTokens: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
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

    const result = await authService.signUp({
      email: 'minji@example.com',
      password: 'StrongPassword123!',
      name: 'Minji',
    });

    expect(usersService.create).toHaveBeenCalled();
    expect(result.tokens.accessToken).toBe('access-token');
    expect(result.tokens.refreshToken).toBe('refresh-token');
    expect(result.user.email).toBe('minji@example.com');
    expect(usersService.updateRefreshTokenHash).toHaveBeenCalled();
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
      authService.signIn({
        email: 'minji@example.com',
        password: 'wrong-password',
      }),
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
    usersService.toResponse.mockReturnValue(user);
    passwordService.verifyRefreshToken.mockResolvedValue(true);
    tokenService.createAuthTokens.mockResolvedValue({
      accessToken: 'next-access-token',
      refreshToken: 'next-refresh-token',
    });
    passwordService.hashRefreshToken.mockResolvedValue(
      'next-refresh-token-hash',
    );

    const result = await authService.refresh({
      userId: 'user-1',
      email: 'minji@example.com',
      refreshToken: 'refresh-token',
    });

    expect(result.tokens.accessToken).toBe('next-access-token');
    expect(result.tokens.refreshToken).toBe('next-refresh-token');
    expect(usersService.updateRefreshTokenHash).toHaveBeenCalled();
  });

  it('signOut should clear the stored refresh token hash', async () => {
    const result = await authService.signOut('user-1');

    expect(result).toEqual({ signedOut: true });
    expect(usersService.updateRefreshTokenHash).toHaveBeenCalledWith(
      'user-1',
      null,
    );
  });
});
