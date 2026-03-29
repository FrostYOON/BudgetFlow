import { ApiProperty } from '@nestjs/swagger';

export class RevokeAuthSessionResponseDto {
  @ApiProperty({ example: true })
  revoked!: boolean;
}
