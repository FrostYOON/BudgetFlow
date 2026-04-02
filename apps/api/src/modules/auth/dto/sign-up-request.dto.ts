import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class SignUpRequestDto {
  @ApiProperty({ example: 'minji@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Minji' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({ example: 'ko-KR' })
  @IsOptional()
  @IsString()
  @Length(2, 20)
  locale?: string;

  @ApiPropertyOptional({ example: 'Asia/Seoul' })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  timezone?: string;
}
