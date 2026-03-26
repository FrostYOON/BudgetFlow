import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-request.interface';
import { AppConfigService } from '../../core/config/app-config.service';
import { AppLoggerService } from '../../core/logger/app-logger.service';
import { UsersService } from '../users/users.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { SignInRequestDto } from './dto/sign-in-request.dto';
import { SignOutResponseDto } from './dto/sign-out-response.dto';
import { SignUpRequestDto } from './dto/sign-up-request.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly appConfig: AppConfigService,
    private readonly logger: AppLoggerService,
  ) {}

  async signUp(input: SignUpRequestDto): Promise<AuthResponseDto> {
    const passwordHash = await hash(
      input.password,
      this.appConfig.passwordHashSaltRounds,
    );

    const user = await this.usersService.create({
      email: input.email,
      passwordHash,
      name: input.name,
    });

    this.logger.log('User created', AuthService.name, {
      userId: user.id,
      email: user.email,
    });

    return this.buildAuthResponse(user.id);
  }

  async signIn(input: SignInRequestDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(input.email);

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Email or password is invalid.');
    }

    const passwordMatches = await compare(input.password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Email or password is invalid.');
    }

    this.logger.log('User signed in', AuthService.name, {
      userId: user.id,
      email: user.email,
    });

    return this.buildAuthResponse(user.id);
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Authenticated user was not found.');
    }

    return this.usersService.toResponse(user);
  }

  async refresh(user: AuthenticatedUser): Promise<AuthResponseDto> {
    const existingUser = await this.usersService.findById(user.userId);

    if (!existingUser || !existingUser.refreshTokenHash || !user.refreshToken) {
      throw new UnauthorizedException('Refresh token is invalid.');
    }

    const refreshTokenMatches = await compare(
      user.refreshToken,
      existingUser.refreshTokenHash,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Refresh token is invalid.');
    }

    this.logger.log('Auth tokens refreshed', AuthService.name, {
      userId: existingUser.id,
      email: existingUser.email,
    });

    return this.buildAuthResponse(existingUser.id);
  }

  async signOut(userId: string): Promise<SignOutResponseDto> {
    await this.usersService.updateRefreshTokenHash(userId, null);

    this.logger.log('User signed out', AuthService.name, {
      userId,
    });

    return {
      signedOut: true,
    };
  }

  private async buildAuthResponse(userId: string): Promise<AuthResponseDto> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Authenticated user was not found.');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          tokenType: 'access',
        },
        {
          secret: this.appConfig.jwtAccessSecret,
          expiresIn: this.appConfig.jwtAccessExpiresInSeconds,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          tokenType: 'refresh',
        },
        {
          secret: this.appConfig.jwtRefreshSecret,
          expiresIn: this.appConfig.jwtRefreshExpiresInSeconds,
        },
      ),
    ]);

    const refreshTokenHash = await hash(
      refreshToken,
      this.appConfig.passwordHashSaltRounds,
    );

    await this.usersService.updateRefreshTokenHash(user.id, refreshTokenHash);

    return {
      user: this.usersService.toResponse(user),
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }
}
