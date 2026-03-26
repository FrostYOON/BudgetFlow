import { WorkspaceMemberStatus } from '@budgetflow/database';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptWorkspaceInviteResponseDto {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  workspaceId!: string;

  @ApiProperty({
    enum: WorkspaceMemberStatus,
    example: WorkspaceMemberStatus.ACTIVE,
  })
  memberStatus!: WorkspaceMemberStatus;
}
