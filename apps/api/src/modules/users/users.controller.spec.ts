import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: {
    updateProfile: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      updateProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get(UsersController);
  });

  it('updateMe should delegate to UsersService', async () => {
    usersService.updateProfile.mockResolvedValue({
      id: 'user-1',
      email: 'minji@example.com',
      name: 'Minji',
      profileImageUrl: null,
      locale: 'ko-KR',
      timezone: 'Asia/Seoul',
      createdAt: new Date('2026-03-24T00:00:00.000Z'),
    });

    const result = await controller.updateMe(
      {
        userId: 'user-1',
        email: 'minji@example.com',
        sessionId: 'session-1',
      },
      {
        name: 'Minji',
        locale: 'ko-KR',
        timezone: 'Asia/Seoul',
        profileImageUrl: null,
      },
    );

    expect(usersService.updateProfile).toHaveBeenCalledWith('user-1', {
      name: 'Minji',
      locale: 'ko-KR',
      timezone: 'Asia/Seoul',
      profileImageUrl: null,
    });
    expect(result.email).toBe('minji@example.com');
  });
});
