import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Schedule, ScheduleSchema } from './schema/schedule.schema';
import { AttractionModule } from '../attraction/attraction.module';
import { FavoriteModule } from '../favorite/favorite.module';
import { RestaurantModule } from '../restaurant/restaurant.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Schedule.name, schema: ScheduleSchema },
    ]),
    AttractionModule,
    FavoriteModule,
    RestaurantModule
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService]
})
export class ScheduleModule { }
