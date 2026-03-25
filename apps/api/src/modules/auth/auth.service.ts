import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { AppConfigService } from '../../core/config/app-config.service';
import { AppLoggerService } from '../../core/logger/app-logger.service';
import { UsersService } from '../users/users.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { SignInRequestDto } from './dto/sign-in-request.dto';
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

  private async buildAuthResponse(userId: string): Promise<AuthResponseDto> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Authenticated user was not found.');
    }

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
      },
      {
        secret: this.appConfig.jwtAccessSecret,
        expiresIn: this.appConfig.jwtAccessExpiresInSeconds,
      },
    );

    return {
      user: this.usersService.toResponse(user),
      tokens: {
        accessToken,
      },
    };
  }
}
