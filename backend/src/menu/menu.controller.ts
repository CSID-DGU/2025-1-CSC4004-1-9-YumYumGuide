import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MenuService } from './menu.service';
// import { CreateMenuDto } from './dto/create-menu.dto'; // Removed as POST is removed
// import { UpdateMenuDto } from './dto/update-menu.dto'; // Removed as PATCH is removed
import { Menu } from './schema/menu.schema';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) { }

  // Removed @Post(), @Get(), @Get(':id'), @Patch(':id'), @Delete(':id')

  @Get('restaurant/:restaurantId')
  findByRestaurantId(@Param('restaurantId') restaurantId: string): Promise<Menu[]> {
    return this.menuService.findByRestaurantId(restaurantId);
  }
}
