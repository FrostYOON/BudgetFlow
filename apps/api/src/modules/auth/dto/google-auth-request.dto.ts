import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, MinLength } from 'class-validator';

export class GoogleAuthRequestDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  code!: string;

  @ApiProperty()
  @IsUrl({
    require_tld: false,
    require_protocol: true,
  })
  redirectUri!: string;
}
