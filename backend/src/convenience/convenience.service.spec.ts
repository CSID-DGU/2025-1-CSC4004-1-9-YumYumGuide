import { Test, TestingModule } from '@nestjs/testing';
import { ConvenienceService } from './convenience.service';

describe('ConvenienceService', () => {
  let service: ConvenienceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConvenienceService],
    }).compile();

    service = module.get<ConvenienceService>(ConvenienceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
