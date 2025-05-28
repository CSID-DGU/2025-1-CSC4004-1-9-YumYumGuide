import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleSchema } from './schema/schedule.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'schedule', schema: ScheduleSchema },
  ])],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule { }
