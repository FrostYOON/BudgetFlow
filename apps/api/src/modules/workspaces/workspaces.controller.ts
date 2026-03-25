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
import { CreateWorkspaceRequestDto } from './dto/create-workspace-request.dto';
import { WorkspaceListItemResponseDto } from './dto/workspace-list-item-response.dto';
import { WorkspaceResponseDto } from './dto/workspace-response.dto';
import { WorkspacesService } from './workspaces.service';

@ApiTags('Workspaces')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a workspace' })
  @ApiBody({ type: CreateWorkspaceRequestDto })
  @ApiOkResponse({ type: WorkspaceResponseDto })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateWorkspaceRequestDto,
  ): Promise<WorkspaceResponseDto> {
    return this.workspacesService.create(user.userId, input);
  }

  @Get()
  @ApiOperation({ summary: 'List my workspaces' })
  @ApiOkResponse({ type: [WorkspaceListItemResponseDto] })
  list(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkspaceListItemResponseDto[]> {
    return this.workspacesService.listForUser(user.userId);
  }

  @Get(':workspaceId')
  @ApiOperation({ summary: 'Get workspace detail' })
  @ApiOkResponse({ type: WorkspaceResponseDto })
  detail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workspaceId', new ParseUUIDPipe()) workspaceId: string,
  ): Promise<WorkspaceResponseDto> {
    return this.workspacesService.getDetail(workspaceId, user.userId);
  }
}
