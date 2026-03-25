import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedRequest } from '../../../common/interfaces/authenticated-request.interface';
import { AppConfigService } from '../../../core/config/app-config.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly appConfig: AppConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.header('authorization');

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Access token is required.');
    }

    const token = header.slice(7);

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.appConfig.jwtAccessSecret,
      });

      request.user = {
        userId: payload.sub,
        email: payload.email,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Access token is invalid.');
    }
  }
}
