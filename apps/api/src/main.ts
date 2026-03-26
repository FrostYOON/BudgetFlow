import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppConfigService } from './core/config/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const appConfig = app.get(AppConfigService);

  if (appConfig.trustProxy) {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }

  app.enableCors({
    origin: appConfig.corsOrigins.length > 0 ? appConfig.corsOrigins : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix(appConfig.apiPrefix);

  const swaggerConfig = new DocumentBuilder()
    .setTitle(appConfig.appName)
    .setDescription('API documentation for the BudgetFlow backend.')
    .setVersion(appConfig.appVersion)
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(appConfig.swaggerPath, app, swaggerDocument, {
    customSiteTitle: `${appConfig.appName} Docs`,
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(appConfig.port);
}
void bootstrap();
