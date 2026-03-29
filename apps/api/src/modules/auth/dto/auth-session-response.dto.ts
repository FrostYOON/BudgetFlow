import { ApiProperty } from '@nestjs/swagger';

export class AuthSessionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ required: false, nullable: true })
  userAgent!: string | null;

  @ApiProperty({ required: false, nullable: true })
  ipAddress!: string | null;

  @ApiProperty()
  expiresAt!: Date;

  @ApiProperty({ required: false, nullable: true })
  lastUsedAt!: Date | null;

  @ApiProperty({ required: false, nullable: true })
  revokedAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  isCurrent!: boolean;
}
