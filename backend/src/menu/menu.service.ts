import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Menu, MenuDocument } from './schema/menu.schema';
// import { CreateMenuDto } from './dto/create-menu.dto'; // Removed as create method is removed
// import { UpdateMenuDto } from './dto/update-menu.dto'; // Removed as update/delete methods are removed

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Menu.name) private menuModel: Model<MenuDocument>,
  ) { }

  async findByRestaurantId(_id: string): Promise<Menu[]> {
    const ObjectId = mongoose.Types.ObjectId;

    return this.menuModel.find({ restaurant_id: new ObjectId(_id) }).lean();
  }
}
