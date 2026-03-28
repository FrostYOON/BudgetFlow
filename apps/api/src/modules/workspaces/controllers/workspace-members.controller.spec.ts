import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceMembersController } from './workspace-members.controller';
import { WorkspaceMembersService } from '../services/workspace-members.service';

describe('WorkspaceMembersController', () => {
  let controller: WorkspaceMembersController;
  let workspaceMembersService: {
    listMembers: jest.Mock;
    updateMyNickname: jest.Mock;
  };

  beforeEach(async () => {
    workspaceMembersService = {
      listMembers: jest.fn(),
      updateMyNickname: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceMembersController],
      providers: [
        {
          provide: WorkspaceMembersService,
          useValue: workspaceMembersService,
        },
      ],
    }).compile();

    controller = module.get(WorkspaceMembersController);
  });

  it('updateMyNickname should delegate to WorkspaceMembersService', async () => {
    workspaceMembersService.updateMyNickname.mockResolvedValue({
      userId: 'user-1',
      name: 'Minji',
      nickname: 'Jisu',
      role: 'MEMBER',
      status: 'ACTIVE',
    });

    const result = await controller.updateMyNickname(
      {
        userId: 'user-1',
        email: 'minji@example.com',
        sessionId: 'session-1',
      },
      'workspace-1',
      {
        nickname: 'Jisu',
      },
    );

    expect(workspaceMembersService.updateMyNickname).toHaveBeenCalledWith(
      'workspace-1',
      'user-1',
      {
        nickname: 'Jisu',
      },
    );
    expect(result.nickname).toBe('Jisu');
  });
});
