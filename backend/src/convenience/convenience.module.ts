import { Module } from '@nestjs/common';
import { ConvenienceService } from './convenience.service';
import { ConvenienceController } from './convenience.controller';

@Module({
  controllers: [ConvenienceController],
  providers: [ConvenienceService],
})
export class ConvenienceModule {}
