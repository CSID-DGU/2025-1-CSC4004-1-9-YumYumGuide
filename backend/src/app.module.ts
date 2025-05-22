import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TestModule } from './test/test.module';
import * as Joi from 'joi';
import { EventsModule } from './api/home/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        ENV: Joi.string().valid('dev', 'prod').required(),
      })
    }),
    TestModule,
    EventsModule,
  ],
})
export class AppModule { }
