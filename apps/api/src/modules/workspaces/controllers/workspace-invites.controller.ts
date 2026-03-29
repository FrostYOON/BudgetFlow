import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
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
import { AcceptWorkspaceInviteResponseDto } from '../dto/accept-workspace-invite-response.dto';
import { CreateWorkspaceInviteRequestDto } from '../dto/create-workspace-invite-request.dto';
import { WorkspaceInviteResponseDto } from '../dto/workspace-invite-response.dto';
import { WorkspaceInvitesService } from '../services/workspace-invites.service';

@ApiTags('Workspace Invites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class WorkspaceInvitesController {
  constructor(
    private readonly workspaceInvitesService: WorkspaceInvitesService,
  ) {}

  @Post('workspaces/:workspaceId/invites')
  @ApiOperation({ summary: 'Create a workspace invite' })
  @ApiBody({ type: CreateWorkspaceInviteRequestDto })
  @ApiOkResponse({ type: WorkspaceInviteResponseDto })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Body() input: CreateWorkspaceInviteRequestDto,
  ): Promise<WorkspaceInviteResponseDto> {
    return this.workspaceInvitesService.createInvite(
      workspaceId,
      user.userId,
      input,
    );
  }

  @Get('workspaces/:workspaceId/invites')
  @ApiOperation({ summary: 'List workspace invites' })
  @ApiOkResponse({ type: [WorkspaceInviteResponseDto] })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
  ): Promise<WorkspaceInviteResponseDto[]> {
    return this.workspaceInvitesService.listInvites(workspaceId, user.userId);
  }

  @Post('workspaces/:workspaceId/invites/:inviteId/revoke')
  @ApiOperation({ summary: 'Revoke a pending workspace invite' })
  @ApiOkResponse({ type: WorkspaceInviteResponseDto })
  revoke(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Param('inviteId', new ParseUUIDPipe()) inviteId: string,
  ): Promise<WorkspaceInviteResponseDto> {
    return this.workspaceInvitesService.revokeInvite(
      workspaceId,
      inviteId,
      user.userId,
    );
  }

  @Post('workspaces/:workspaceId/invites/:inviteId/resend')
  @ApiOperation({ summary: 'Resend a pending workspace invite' })
  @ApiOkResponse({ type: WorkspaceInviteResponseDto })
  resend(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
    @Param('inviteId', new ParseUUIDPipe()) inviteId: string,
  ): Promise<WorkspaceInviteResponseDto> {
    return this.workspaceInvitesService.resendInvite(
      workspaceId,
      inviteId,
      user.userId,
    );
  }

  @Post('workspace-invites/:token/accept')
  @ApiOperation({ summary: 'Accept a workspace invite' })
  @ApiOkResponse({ type: AcceptWorkspaceInviteResponseDto })
  accept(
    @CurrentUser() user: AuthenticatedUser,
    @Param('token') token: string,
  ): Promise<AcceptWorkspaceInviteResponseDto> {
    return this.workspaceInvitesService.acceptInvite(token, user);
  }
}
