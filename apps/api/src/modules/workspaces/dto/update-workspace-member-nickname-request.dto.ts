import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Length, ValidateIf } from 'class-validator';

function normalizeOptionalString(value: unknown): string | null | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  return value === '' ? null : value;
}

export class UpdateWorkspaceMemberNicknameRequestDto {
  @ApiPropertyOptional({ example: 'Jisu' })
  @Transform(({ value }) => normalizeOptionalString(value))
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @Length(1, 50)
  nickname?: string | null;
}
