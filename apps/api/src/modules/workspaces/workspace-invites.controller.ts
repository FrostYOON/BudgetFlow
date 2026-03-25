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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AcceptWorkspaceInviteResponseDto } from './dto/accept-workspace-invite-response.dto';
import { CreateWorkspaceInviteRequestDto } from './dto/create-workspace-invite-request.dto';
import { WorkspaceInviteResponseDto } from './dto/workspace-invite-response.dto';
import { WorkspaceInvitesService } from './workspace-invites.service';

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
