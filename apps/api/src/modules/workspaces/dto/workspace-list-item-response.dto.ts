import {
  WorkspaceMemberRole,
  WorkspaceType,
} from '../../../../../../packages/database/generated/client';
import { ApiProperty } from '@nestjs/swagger';

export class WorkspaceListItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Minji & Jisu Home' })
  name!: string;

  @ApiProperty({ enum: WorkspaceType, example: WorkspaceType.COUPLE })
  type!: WorkspaceType;

  @ApiProperty({ example: 'KRW' })
  baseCurrency!: string;

  @ApiProperty({ example: 'Asia/Seoul' })
  timezone!: string;

  @ApiProperty({
    enum: WorkspaceMemberRole,
    example: WorkspaceMemberRole.OWNER,
  })
  memberRole!: WorkspaceMemberRole;
}
