import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../core/database/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('updateProfile should update the current user profile', async () => {
    prisma.user.update.mockResolvedValue({
      id: 'user-1',
      email: 'minji@example.com',
      passwordHash: 'hash',
      name: 'Minji',
      profileImageUrl: 'https://example.com/avatar.png',
      locale: 'en-US',
      timezone: 'America/Toronto',
      createdAt: new Date('2026-03-24T00:00:00.000Z'),
      updatedAt: new Date('2026-03-24T00:05:00.000Z'),
    });

    const result = await service.updateProfile('user-1', {
      name: 'Minji',
      locale: 'en-US',
      timezone: 'America/Toronto',
      profileImageUrl: 'https://example.com/avatar.png',
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        name: 'Minji',
        profileImageUrl: 'https://example.com/avatar.png',
        locale: 'en-US',
        timezone: 'America/Toronto',
      },
    });
    expect(result.profileImageUrl).toBe('https://example.com/avatar.png');
  });

  it('updateProfile should reject empty payloads', async () => {
    await expect(service.updateProfile('user-1', {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
