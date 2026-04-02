import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../core/config/app-config.service';
import { HealthResponseDto } from './dto/health-response.dto';

@Injectable()
export class HealthService {
  constructor(private readonly appConfig: AppConfigService) {}

  getStatus(): HealthResponseDto {
    return {
      service: this.appConfig.appName,
      status: 'ok',
      version: this.appConfig.appVersion,
      timestamp: new Date().toISOString(),
    };
  }
}
