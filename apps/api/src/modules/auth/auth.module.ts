import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppConfigService } from '../../core/config/app-config.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AccessTokenStrategy } from './strategies/access-token.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (appConfig: AppConfigService) => ({
        secret: appConfig.jwtAccessSecret,
        signOptions: {
          expiresIn: appConfig.jwtAccessExpiresInSeconds,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, AccessTokenStrategy],
  exports: [PassportModule, JwtModule, JwtAuthGuard],
})
export class AuthModule {}
