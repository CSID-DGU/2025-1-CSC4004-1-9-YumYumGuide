import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { EventsModule } from './api/home/events.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AttractionModule } from './attraction/attraction.module';
import { ConvenienceModule } from './convenience/convenience.module';
import { ScheduleModule } from './schedule/schedule.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { MenuModule } from './menu/menu.module';
import { SearchModule } from './search/search.module';

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
    EventsModule,
    RestaurantModule,
    MenuModule,
    SearchModule
  ],
  providers: []
})
export class AppModule { }
