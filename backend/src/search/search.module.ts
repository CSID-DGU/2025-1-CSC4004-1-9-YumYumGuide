import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Restaurant } from './schemas/restaurant.schema';
import { RestaurantSchema } from './schemas/restaurant.schema';
import { Attraction } from './schemas/attraction.schema';
import { AttractionSchema } from './schemas/attraction.schema';
import { ElasticsearchModule, ElasticsearchModuleOptions } from '@nestjs/elasticsearch';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Attraction.name, schema: AttractionSchema },
    ]),
    ElasticsearchModule.registerAsync({
      useFactory: (): ElasticsearchModuleOptions => ({
        node: process.env.ES_NODE || 'http://localhost:3000',
        auth: {
          username: process.env.ES_USER || 'elastic',
          password: process.env.ES_PASS || 'changeme',
        },
        tls: { rejectUnauthorized: false }, // 필요 시
      }),
    }),
  ],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService]
})

export class SearchModule { }