import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',  // 프론트엔드 주소
      'https://kauth.kakao.com', // 카카오 인증 서버
      'https://kapi.kakao.com'   // 카카오 API 서버
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,  // 쿠키 전송을 위해 필요
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }));
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
