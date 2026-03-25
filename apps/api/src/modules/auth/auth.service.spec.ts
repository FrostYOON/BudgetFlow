import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AppConfigService } from '../../core/config/app-config.service';
import { AppLoggerService } from '../../core/logger/app-logger.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: {
    create: jest.Mock;
    findByEmail: jest.Mock;
    findById: jest.Mock;
    toResponse: jest.Mock;
  };
  let jwtService: {
    signAsync: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      toResponse: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        AppConfigService,
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

  it('signUp should create a user and issue an access token', async () => {
    const createdUser = {
      id: 'user-1',
      email: 'minji@example.com',
      name: 'Minji',
      locale: 'ko-KR',
      timezone: 'Asia/Seoul',
      createdAt: new Date('2026-03-24T00:00:00.000Z'),
    };

    usersService.create.mockResolvedValue(createdUser);
    usersService.findById.mockResolvedValue(createdUser);
    usersService.toResponse.mockReturnValue(createdUser);
    jwtService.signAsync.mockResolvedValue('access-token');

    const result = await authService.signUp({
      email: 'minji@example.com',
      password: 'StrongPassword123!',
      name: 'Minji',
    });

    expect(usersService.create).toHaveBeenCalled();
    expect(result.tokens.accessToken).toBe('access-token');
    expect(result.user.email).toBe('minji@example.com');
  });

  it('signIn should throw when password is invalid', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'minji@example.com',
      passwordHash:
        '$2b$10$PEmjTePlL3W0Qm7lvcVnV.RXqEJ10BGSAdoo6gWQBaIjXImQxGc1m',
    });

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
});
