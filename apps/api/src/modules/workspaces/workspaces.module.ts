import { Module } from '@nestjs/common';
import { WorkspaceInvitesController } from './controllers/workspace-invites.controller';
import { WorkspaceMembersController } from './controllers/workspace-members.controller';
import { WorkspacesController } from './controllers/workspaces.controller';
import { WorkspaceInvitesService } from './services/workspace-invites.service';
import { WorkspaceMembersService } from './services/workspace-members.service';
import { WorkspacesService } from './services/workspaces.service';

@Module({
  controllers: [
    WorkspacesController,
    WorkspaceInvitesController,
    WorkspaceMembersController,
  ],
  providers: [
    WorkspacesService,
    WorkspaceInvitesService,
    WorkspaceMembersService,
  ],
})
export class WorkspacesModule {}
