import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { WorkspaceMemberResponseDto } from '../dto/workspace-member-response.dto';
import { UpdateWorkspaceMemberNicknameRequestDto } from '../dto/update-workspace-member-nickname-request.dto';
import { WorkspaceMembersService } from '../services/workspace-members.service';

@ApiTags('Workspace Members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces/:workspaceId/members')
export class WorkspaceMembersController {
  constructor(
    private readonly workspaceMembersService: WorkspaceMembersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List workspace members' })
  @ApiOkResponse({ type: [WorkspaceMemberResponseDto] })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
  ): Promise<WorkspaceMemberResponseDto[]> {
    return this.workspaceMembersService.listMembers(workspaceId, user.userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update my workspace nickname' })
  @ApiBody({ type: UpdateWorkspaceMemberNicknameRequestDto })
  @ApiOkResponse({ type: WorkspaceMemberResponseDto })
  updateMyNickname(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Body() input: UpdateWorkspaceMemberNicknameRequestDto,
  ): Promise<WorkspaceMemberResponseDto> {
    return this.workspaceMembersService.updateMyNickname(
      workspaceId,
      user.userId,
      input,
    );
  }

  @Delete(':memberUserId')
  @ApiOperation({ summary: 'Remove an active workspace member' })
  @ApiOkResponse({ type: WorkspaceMemberResponseDto })
  removeMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Param('memberUserId', new ParseUUIDPipe()) memberUserId: string,
  ): Promise<WorkspaceMemberResponseDto> {
    return this.workspaceMembersService.removeMember(
      workspaceId,
      user.userId,
      memberUserId,
    );
  }
}
