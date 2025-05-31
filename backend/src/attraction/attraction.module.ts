import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttractionService } from './attraction.service';
import { AttractionController } from './attraction.controller';
import { Attraction, AttractionSchema } from './schema/attraction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attraction.name, schema: AttractionSchema },
    ]),
  ],
  controllers: [AttractionController],
  providers: [AttractionService],
  exports: [AttractionService],
})
export class AttractionModule { }
