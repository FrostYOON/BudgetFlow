import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { AuthTokensDto } from './auth-tokens.dto';

export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;

  @ApiProperty({ type: AuthTokensDto })
  tokens!: AuthTokensDto;
}
