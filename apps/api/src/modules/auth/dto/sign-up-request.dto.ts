import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class SignUpRequestDto {
  @ApiProperty({ example: 'minji@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message:
      'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
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
