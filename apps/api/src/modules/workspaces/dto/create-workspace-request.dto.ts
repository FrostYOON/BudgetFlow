import { WorkspaceType } from '../../../../../../packages/database/generated/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateWorkspaceRequestDto {
  @ApiProperty({ example: 'Minji & Jisu Home' })
  @IsString()
  @Length(2, 100)
  name!: string;

  @ApiProperty({ enum: WorkspaceType, example: WorkspaceType.COUPLE })
  @IsEnum(WorkspaceType)
  type!: WorkspaceType;

  @ApiProperty({ example: 'KRW', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  baseCurrency?: string;

  @ApiProperty({ example: 'Asia/Seoul', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  timezone?: string;
}
