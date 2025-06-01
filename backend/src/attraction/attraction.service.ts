import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAttractionDto } from './dto/create-attraction.dto';
import { UpdateAttractionDto } from './dto/update-attraction.dto';
import { Attraction, AttractionDocument } from './schema/attraction.schema';
import { ApiResponse } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/common/dto/api.response.dto';
import mongoose from 'mongoose';

@Injectable()
export class AttractionService {
  constructor(
    @InjectModel(Attraction.name) private attractionModel: Model<AttractionDocument>,
  ) { }

  async create(createAttractionDto: CreateAttractionDto) {
    const createdAttraction = new this.attractionModel(createAttractionDto);
    return createdAttraction.save();
  }

  async findAll() {
    return this.attractionModel.find().exec();
  }

  async findByType(type: string): Promise<any[]> {
    const collectionName = type === 'restaurant' ? 'restaurants' : 'attractions';
    // @ts-ignore: client는 실제로 존재함
    return (this.attractionModel.db as any).client.db('main').collection(collectionName).find().toArray();
  }

  async findOne(_id: string) {
    const ObjectId = mongoose.Types.ObjectId;
    const attraction = await this.attractionModel.findOne({ _id: new ObjectId(_id) }).lean();
    if (!attraction) {
      return new NotFoundException()
    }
    return new ApiResponseDto(true, 200, 'success', attraction);
  }

  async update(id: string, updateAttractionDto: UpdateAttractionDto) {
    return this.attractionModel.findByIdAndUpdate(id, updateAttractionDto, { new: true }).exec();
  }

  async remove(id: string) {
    return this.attractionModel.findByIdAndDelete(id).exec();
  }
}
