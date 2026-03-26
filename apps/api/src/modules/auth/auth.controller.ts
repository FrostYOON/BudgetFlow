import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-request.interface';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenRequestDto } from './dto/refresh-token-request.dto';
import { SignInRequestDto } from './dto/sign-in-request.dto';
import { SignOutResponseDto } from './dto/sign-out-response.dto';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @ApiOperation({ summary: 'Create a user account' })
  @ApiBody({ type: SignUpRequestDto })
  @ApiOkResponse({ type: AuthResponseDto })
  signUp(@Body() input: SignUpRequestDto): Promise<AuthResponseDto> {
    return this.authService.signUp(input);
  }

  @Post('sign-in')
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiBody({ type: SignInRequestDto })
  @ApiOkResponse({ type: AuthResponseDto })
  signIn(@Body() input: SignInRequestDto): Promise<AuthResponseDto> {
    return this.authService.signIn(input);
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({ summary: 'Rotate auth tokens using a refresh token' })
  @ApiBody({ type: RefreshTokenRequestDto })
  @ApiOkResponse({ type: AuthResponseDto })
  refresh(@CurrentUser() user: AuthenticatedUser): Promise<AuthResponseDto> {
    return this.authService.refresh(user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiOkResponse({ type: UserResponseDto })
  me(@CurrentUser() user: AuthenticatedUser): Promise<UserResponseDto> {
    return this.authService.me(user.userId);
  }

  @Post('sign-out')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sign out and revoke the current refresh token' })
  @ApiOkResponse({ type: SignOutResponseDto })
  signOut(@CurrentUser() user: AuthenticatedUser): Promise<SignOutResponseDto> {
    return this.authService.signOut(user.userId);
  }
}
