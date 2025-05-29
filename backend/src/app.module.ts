import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TestModule } from './test/test.module';
import { SearchModule } from './search/search.module'
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsModule } from './api/home/events.module';
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
<<<<<<< HEAD
        ENV: Joi.string().valid('dev', 'prod').required(),
=======
        KAKAO_CLIENT_ID: Joi.string().required(),
        KAKAO_CALLBACK_URL: Joi.string().required(),
        MONGODB_URI: Joi.string().required(),
        GOOGLE_MAPS_API_KEY: Joi.string().required(),
        OPENAI_API_KEY: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
>>>>>>> main
      })
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
<<<<<<< HEAD
    TestModule,
    SearchModule
  ]
=======
    AuthModule,
    UserModule,
    AttractionModule,
    ConvenienceModule,
    ScheduleModule,
    EventsModule,
  ],
  providers: []
>>>>>>> main
})
export class AppModule { }
