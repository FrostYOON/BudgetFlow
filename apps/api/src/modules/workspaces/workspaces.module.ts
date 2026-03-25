import { Module } from '@nestjs/common';
import { WorkspaceInvitesController } from './workspace-invites.controller';
import { WorkspaceMembersController } from './workspace-members.controller';
import { WorkspaceInvitesService } from './workspace-invites.service';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';

@Module({
  controllers: [
    WorkspacesController,
    WorkspaceInvitesController,
    WorkspaceMembersController,
  ],
  providers: [WorkspacesService, WorkspaceInvitesService],
})
export class WorkspacesModule {}
