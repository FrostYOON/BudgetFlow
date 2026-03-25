import {
  WorkspaceMemberRole,
  WorkspaceMemberStatus,
} from '@budgetflow/database';
import { ApiProperty } from '@nestjs/swagger';

export class WorkspaceInviteResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'jisu@example.com' })
  email!: string;

  @ApiProperty({
    enum: WorkspaceMemberRole,
    example: WorkspaceMemberRole.MEMBER,
  })
  role!: WorkspaceMemberRole;

  @ApiProperty({
    enum: WorkspaceMemberStatus,
    example: WorkspaceMemberStatus.INVITED,
  })
  status!: WorkspaceMemberStatus;

  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  workspaceId!: string;

  @ApiProperty({ example: 'token-value' })
  token!: string;

  @ApiProperty({ example: '2026-03-31T23:59:59.000Z' })
  expiresAt!: Date;
}
