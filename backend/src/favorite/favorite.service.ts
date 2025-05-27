import { Injectable } from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Favorite, FavoriteDocument } from './schema/favorite.schema';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectModel(Favorite.name) private readonly favoriteModel: Model<FavoriteDocument>,
  ) {}

  async create(userId: string, createFavoriteDto: CreateFavoriteDto): Promise<FavoriteDocument> {
    const favoriteToCreate = { ...createFavoriteDto, userId };
    const createdFavorite = new this.favoriteModel(favoriteToCreate);
    return createdFavorite.save();
  }

  findAll() {
    return this.favoriteModel.find().exec();
  }

  async findOne(id: string): Promise<FavoriteDocument | null> {
    return this.favoriteModel.findById(id).exec();
  }

  async findByUserId(userId: string): Promise<FavoriteDocument | null> {
    return this.favoriteModel.findOne({ userId }).exec();
  }

  async updateByUserId(userId: string, updateFavoriteDto: UpdateFavoriteDto): Promise<FavoriteDocument | null> {
    return this.favoriteModel.findOneAndUpdate(
      { userId },
      updateFavoriteDto,
      { 
        new: true,
        upsert: true,
        runValidators: true,
      }
    ).exec();
  }

  async remove(id: string): Promise<FavoriteDocument | null> {
    return this.favoriteModel.findByIdAndDelete(id).exec();
  }

  async removeByUserId(userId: string): Promise<{ deletedCount?: number }> {
    const result = await this.favoriteModel.deleteOne({ userId }).exec();
    return { deletedCount: result.deletedCount };
  }
}
