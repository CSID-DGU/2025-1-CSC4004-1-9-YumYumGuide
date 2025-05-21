import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConvenienceService } from './convenience.service';
import { CreateConvenienceDto } from './dto/create-convenience.dto';
import { UpdateConvenienceDto } from './dto/update-convenience.dto';

@Controller('convenience')
export class ConvenienceController {
  constructor(private readonly convenienceService: ConvenienceService) {}

  @Post()
  create(@Body() createConvenienceDto: CreateConvenienceDto) {
    return this.convenienceService.create(createConvenienceDto);
  }

  @Get()
  findAll() {
    return this.convenienceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.convenienceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConvenienceDto: UpdateConvenienceDto) {
    return this.convenienceService.update(+id, updateConvenienceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.convenienceService.remove(+id);
  }
}
