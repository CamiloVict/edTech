import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const webOrigins =
    process.env.WEB_ORIGIN?.split(',').map((o) => o.trim()) ?? [
      'http://localhost:3000',
    ];

  app.enableCors({
    origin: webOrigins,
    credentials: true,
  });

  app.setGlobalPrefix('v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
}

bootstrap();
