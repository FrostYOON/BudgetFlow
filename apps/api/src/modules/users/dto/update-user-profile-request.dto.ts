import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';

function normalizeOptionalString(value: unknown): string | null | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  return value === '' ? null : value;
}

export class UpdateUserProfileRequestDto {
  @ApiPropertyOptional({ example: 'Minji' })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  @Transform(({ value }) => normalizeOptionalString(value))
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
  })
  profileImageUrl?: string | null;

  @ApiPropertyOptional({ example: 'ko-KR' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z]{2}-[A-Z]{2}$/)
  locale?: string;

  @ApiPropertyOptional({ example: 'Asia/Seoul' })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  timezone?: string;
}
