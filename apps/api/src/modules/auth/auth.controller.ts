import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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
import { AuthSessionResponseDto } from './dto/auth-session-response.dto';
import { ChangePasswordRequestDto } from './dto/change-password-request.dto';
import { ChangePasswordResponseDto } from './dto/change-password-response.dto';
import { RefreshTokenRequestDto } from './dto/refresh-token-request.dto';
import { RevokeAuthSessionResponseDto } from './dto/revoke-auth-session-response.dto';
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

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change the current user password' })
  @ApiBody({ type: ChangePasswordRequestDto })
  @ApiOkResponse({ type: ChangePasswordResponseDto })
  changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: ChangePasswordRequestDto,
  ): Promise<ChangePasswordResponseDto> {
    return this.authService.changePassword(user, input);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List auth sessions for the current user' })
  @ApiOkResponse({ type: [AuthSessionResponseDto] })
  listSessions(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AuthSessionResponseDto[]> {
    return this.authService.listSessions(user);
  }

  @Post('sessions/revoke-others')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke every session except the current one' })
  @ApiOkResponse({ type: RevokeAuthSessionResponseDto })
  revokeOtherSessions(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RevokeAuthSessionResponseDto> {
    return this.authService.revokeOtherSessions(user);
  }

  @Post('sessions/:sessionId/revoke')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a specific auth session' })
  @ApiOkResponse({ type: RevokeAuthSessionResponseDto })
  revokeSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
  ): Promise<RevokeAuthSessionResponseDto> {
    return this.authService.revokeSession(user, sessionId);
  }
}
