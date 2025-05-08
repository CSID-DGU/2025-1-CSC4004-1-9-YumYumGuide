import { Injectable } from '@nestjs/common';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { OpenAIClient } from '../client/openai.client';

@Injectable()
export class TestService {
  constructor(
    private readonly openaiClient: OpenAIClient,
  ) {

  }
  async create(createTestDto: CreateTestDto) {
    const result = await this.openaiClient.generateArticle(
      ['야마 레스토랑', '그릴 아카사카', '미야모토야'],
      ['아라쿠라야마 센겐 공원', '오시노핫카이', '오이시 공원'],
      '2025-05-10',
      '2025-05-11',
    );
    console.log(result);
    return "성공";
  }

  findAll() {
    return `This action returns all test`;
  }

  findOne(id: number) {
    return `This action returns a #${id} test`;
  }

  update(id: number, updateTestDto: UpdateTestDto) {
    return `This action updates a #${id} test`;
  }

  remove(id: number) {
    return `This action removes a #${id} test`;
  }
}
