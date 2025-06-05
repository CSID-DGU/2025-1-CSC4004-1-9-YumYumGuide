import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Attraction', schema: 'Attraction' },
      { name: 'Restaurant', schema: 'Restaurant' },
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule { } 