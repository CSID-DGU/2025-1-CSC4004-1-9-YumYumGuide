import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { OpenAIClient } from 'src/client/openai.client';

@Module({
  controllers: [TestController],
  providers: [TestService, OpenAIClient],
})
export class TestModule { }
