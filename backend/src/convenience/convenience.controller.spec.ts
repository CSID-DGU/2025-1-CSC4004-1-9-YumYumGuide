import { Test, TestingModule } from '@nestjs/testing';
import { ConvenienceController } from './convenience.controller';
import { ConvenienceService } from './convenience.service';

describe('ConvenienceController', () => {
  let controller: ConvenienceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConvenienceController],
      providers: [ConvenienceService],
    }).compile();

    controller = module.get<ConvenienceController>(ConvenienceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
