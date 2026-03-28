import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateWorkspaceMemberNicknameRequestDto {
  @ApiPropertyOptional({ example: 'Jisu' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  nickname?: string | null;
}
