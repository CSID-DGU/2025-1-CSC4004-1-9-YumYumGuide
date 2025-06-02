import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Restaurant, RestaurantDocument } from './schema/restaurant.schema';
import { ApiResponseDto } from 'src/common/dto/api.response.dto';
import { MenuService } from '../menu/menu.service';
import { Menu } from '../menu/schema/menu.schema';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectModel(Restaurant.name) private readonly restaurantModel: Model<RestaurantDocument>,
    private readonly menuService: MenuService,
  ) { }


  async findOne(_id: string) {

    const ObjectId = mongoose.Types.ObjectId;
    const restaurant = await this.restaurantModel.findOne({ _id: new ObjectId(_id) }).lean();

    if (!restaurant) {
      return new NotFoundException()
    }

    const menus: Menu[] = await this.menuService.findByRestaurantId(_id);

    const restaurantWithMenus = { ...restaurant, menus };

    return new ApiResponseDto(true, 200, 'success', restaurantWithMenus);
  }
} 