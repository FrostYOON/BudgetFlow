import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppConfigService } from './core/config/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appConfig = app.get(AppConfigService);
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
