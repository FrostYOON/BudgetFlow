import {
  WorkspaceMemberRole,
  WorkspaceMemberStatus,
} from '@budgetflow/database';
import { ApiProperty } from '@nestjs/swagger';

export class WorkspaceMemberResponseDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty({ example: 'Minji' })
  name!: string;

  @ApiProperty({
    enum: WorkspaceMemberRole,
    example: WorkspaceMemberRole.OWNER,
  })
  role!: WorkspaceMemberRole;

  @ApiProperty({
    enum: WorkspaceMemberStatus,
    example: WorkspaceMemberStatus.ACTIVE,
  })
  status!: WorkspaceMemberStatus;
}
