import { Injectable } from '@nestjs/common';
import { CreateConvenienceDto } from './dto/create-convenience.dto';
import { UpdateConvenienceDto } from './dto/update-convenience.dto';

@Injectable()
export class ConvenienceService {
  create(createConvenienceDto: CreateConvenienceDto) {
    return 'This action adds a new convenience';
  }

  findAll() {
    return `This action returns all convenience`;
  }

  findOne(id: number) {
    return `This action returns a #${id} convenience`;
  }

  update(id: number, updateConvenienceDto: UpdateConvenienceDto) {
    return `This action updates a #${id} convenience`;
  }

  remove(id: number) {
    return `This action removes a #${id} convenience`;
  }
}
