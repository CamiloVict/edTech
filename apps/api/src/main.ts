import './load-dev-env';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  console.log('[bootstrap] NestFactory.create finished');

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
  console.log(`[bootstrap] calling app.listen(${port})…`);
  await app.listen(port, '0.0.0.0');
  // Ayuda a saber cuándo ya se puede abrir el navegador (antes de esto verás ERR_CONNECTION_REFUSED).
  console.log(`API listening on http://127.0.0.1:${port}/v1/health`);
}

bootstrap().catch((err) => {
  console.error('[bootstrap] failed:', err);
  process.exit(1);
});
