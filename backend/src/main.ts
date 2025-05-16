import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('YumYumGuide') // 제목
    .setDescription('YumYumGuide API 문서') // 설명
    .setVersion('1.0') // 버전
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config); // 문서를 만들기

  SwaggerModule.setup('docs', app, document); // 문서를 설정하기

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
