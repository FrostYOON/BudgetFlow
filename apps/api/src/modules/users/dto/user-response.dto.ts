import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'minji@example.com' })
  email!: string;

  @ApiProperty({ example: 'Minji' })
  name!: string;

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'https://example.com/avatar.png',
  })
  profileImageUrl!: string | null;

  @ApiProperty({ example: 'ko-KR' })
  locale!: string;

  @ApiProperty({ example: 'Asia/Seoul' })
  timezone!: string;

  @ApiProperty({ example: '2026-03-24T12:00:00.000Z' })
  createdAt!: Date;
}
