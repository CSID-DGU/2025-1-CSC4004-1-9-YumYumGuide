import { Module } from '@nestjs/common';
import { AttractionService } from './attraction.service';
import { AttractionController } from './attraction.controller';
import { AttractionSchema } from './schema/attraction.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'attraction', schema: AttractionSchema },
  ])],
  controllers: [AttractionController],
  providers: [AttractionService],
})
export class AttractionModule { }
