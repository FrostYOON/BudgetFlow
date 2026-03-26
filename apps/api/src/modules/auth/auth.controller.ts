import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-request.interface';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenRequestDto } from './dto/refresh-token-request.dto';
import { SignInRequestDto } from './dto/sign-in-request.dto';
import { SignOutResponseDto } from './dto/sign-out-response.dto';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { AuthCookieService } from './services/auth-cookie.service';
import { AuthService } from './services/auth.service';
import { getAuthRequestContext } from './utils/get-auth-request-context.util';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  @Post('sign-up')
  @ApiOperation({ summary: 'Create a user account' })
  @ApiBody({ type: SignUpRequestDto })
  @ApiOkResponse({ type: AuthResponseDto })
  async signUp(
    @Body() input: SignUpRequestDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const authResponse = await this.authService.signUp(
      input,
      getAuthRequestContext(request),
    );

    if (authResponse.tokens.refreshToken) {
      this.authCookieService.setRefreshTokenCookie(
        response,
        authResponse.tokens.refreshToken,
      );
    }

    return this.authCookieService.toClientResponse(authResponse);
  }

  @Post('sign-in')
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiBody({ type: SignInRequestDto })
  @ApiOkResponse({ type: AuthResponseDto })
  async signIn(
    @Body() input: SignInRequestDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const authResponse = await this.authService.signIn(
      input,
      getAuthRequestContext(request),
    );

    if (authResponse.tokens.refreshToken) {
      this.authCookieService.setRefreshTokenCookie(
        response,
        authResponse.tokens.refreshToken,
      );
    }

    return this.authCookieService.toClientResponse(authResponse);
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({
    summary: 'Rotate auth tokens using a refresh token from cookie or body',
  })
  @ApiBody({ type: RefreshTokenRequestDto })
  @ApiOkResponse({ type: AuthResponseDto })
  async refresh(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const authResponse = await this.authService.refresh(
      user,
      getAuthRequestContext(request),
    );

    if (authResponse.tokens.refreshToken) {
      this.authCookieService.setRefreshTokenCookie(
        response,
        authResponse.tokens.refreshToken,
      );
    }

    return this.authCookieService.toClientResponse(authResponse);
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
  async signOut(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<SignOutResponseDto> {
    this.authCookieService.clearRefreshTokenCookie(response);
    return this.authService.signOut(user);
  }
}
