import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AttractionService } from './attraction.service';
import { CreateAttractionDto } from './dto/create-attraction.dto';
import { UpdateAttractionDto } from './dto/update-attraction.dto';
import { Attraction } from './schema/attraction.schema';

@Controller('attraction')
export class AttractionController {
  constructor(private readonly attractionService: AttractionService) { }

  @Post()
  create(@Body() createAttractionDto: CreateAttractionDto): Promise<Attraction> {
    return this.attractionService.create(createAttractionDto);
  }

  @Get()
  findAll(): Promise<Attraction[]> {
    return this.attractionService.findAll();
  }

  @Get('search')
  search(@Query('q') query: string): Promise<Attraction[]> {
    return this.attractionService.search(query);
  }


  @Get('detail/:id')
  findOne(@Param('id') id: string): Promise<Attraction> {
    return this.attractionService.findOne(id);
  }

}
