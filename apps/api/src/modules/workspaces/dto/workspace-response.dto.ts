import { WorkspaceType } from '../../../../../../packages/database/generated/client';
import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceMemberResponseDto } from './workspace-member-response.dto';

export class WorkspaceResponseDto {
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

  @ApiProperty()
  ownerUserId!: string;

  @ApiProperty({ type: [WorkspaceMemberResponseDto], required: false })
  members?: WorkspaceMemberResponseDto[];
}
