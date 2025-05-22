import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ConvenienceService } from './convenience.service';
import { CreateConvenienceDto } from './dto/create-convenience.dto';
import { UpdateConvenienceDto } from './dto/update-convenience.dto';
import { ConvenienceCategory } from './enums/convenience-category.enum';
import { ConvenienceCategoryPipe } from './pipe/convenience-category.pipe';
import { GetConvenienceDto } from './dto/get-conveneience.dto';

@Controller('convenience')
export class ConvenienceController {
  constructor(private readonly convenienceService: ConvenienceService) { }

  @Get('goods/:id')
  findOneGoods(@Param('id') id: string) {

    return this.convenienceService.findOneGoods(id);
  }

  @Get()
  findOneConvenienceAllGoods(@Query() category: GetConvenienceDto) {
    return this.convenienceService.findOneConvenienceAllGoods(category);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.convenienceService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateConvenienceDto: UpdateConvenienceDto) {
  //   return this.convenienceService.update(+id, updateConvenienceDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.convenienceService.remove(+id);
  // }
}
