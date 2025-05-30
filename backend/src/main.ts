import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api'); // 전역 API 접두사 설정

  const config = new DocumentBuilder()
    .setTitle('YumYumGuide') // 제목
    .setDescription('YumYumGuide API 문서') // 설명
    .setVersion('1.0') // 버전
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config); // 문서를 만들기

  SwaggerModule.setup('docs', app, document); // 문서를 설정하기

  // 쿠키 파서 미들웨어 추가
  app.use(cookieParser());

  // CORS 설정 통합
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://kauth.kakao.com',
      'https://kapi.kakao.com',
      'https://accounts.kakao.com',
      process.env.FRONTEND_URL
    ].filter((origin): origin is string => typeof origin === 'string'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  console.log('Attempting to start server on port:', process.env.PORT || 5000); // 로그 추가
  await app.listen(process.env.PORT || 5000); 
  console.log(`Server is listening on port ${await app.getUrl()}`); // 로그 추가
}
bootstrap();