import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }));
  // CORS 허용 추가
  app.enableCors({
    origin: true, // 프론트엔드 주소
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();