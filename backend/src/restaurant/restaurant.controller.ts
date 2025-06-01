import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Restaurant } from './schema/restaurant.schema';

@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) { }

  @Get('detail/:id')
  findOne(@Param('id') id: string) {
    return this.restaurantService.findOne(id);
  }

} 