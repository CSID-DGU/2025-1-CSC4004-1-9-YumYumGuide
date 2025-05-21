import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AttractionModule } from './attraction/attraction.module';
import { ConvenienceModule } from './convenience/convenience.module';
import { ScheduleModule } from './schedule/schedule.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        KAKAO_CLIENT_ID: Joi.string().required(),
        KAKAO_CALLBACK_URL: Joi.string().required(),
        MONGODB_URI: Joi.string().required(),
        GOOGLE_MAPS_API_KEY: Joi.string().required(),
        OPENAI_API_KEY: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
      })
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    AttractionModule,
    ConvenienceModule,
    ScheduleModule,
  ],
  providers: []
})
export class AppModule { }
