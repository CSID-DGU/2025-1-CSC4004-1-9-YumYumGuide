import { Module } from '@nestjs/common';
import { ConvenienceService } from './convenience.service';
import { ConvenienceController } from './convenience.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConvenienceSchema } from './schema/convenience.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'Convenience', schema: ConvenienceSchema },
  ])],
  controllers: [ConvenienceController],
  providers: [ConvenienceService],
})
export class ConvenienceModule { }
