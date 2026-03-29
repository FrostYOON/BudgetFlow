import { WorkspaceType } from '@budgetflow/database';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateWorkspaceRequestDto {
  @ApiPropertyOptional({ example: 'Minji & Jisu Home' })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @ApiPropertyOptional({ enum: WorkspaceType, example: WorkspaceType.COUPLE })
  @IsOptional()
  @IsEnum(WorkspaceType)
  type?: WorkspaceType;

  @ApiPropertyOptional({ example: 'KRW' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  baseCurrency?: string;

  @ApiPropertyOptional({ example: 'Asia/Seoul' })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  timezone?: string;
}
