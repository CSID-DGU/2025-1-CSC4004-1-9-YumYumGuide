import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Restaurant } from './schemas/restaurant.schema';
import { RestaurantSchema } from './schemas/restaurant.schema';
import { Attraction } from './schemas/attraction.schema';
import { AttractionSchema } from './schemas/attraction.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Restaurant.name, schema: RestaurantSchema },
    { name: Attraction.name, schema: AttractionSchema },])],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService]
})
export class SearchModule { }
