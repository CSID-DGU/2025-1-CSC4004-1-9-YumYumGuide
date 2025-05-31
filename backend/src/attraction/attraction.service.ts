import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attraction } from './schema/attraction.schema';
import { CreateAttractionDto } from './dto/create-attraction.dto';
import { UpdateAttractionDto } from './dto/update-attraction.dto';

@Injectable()
export class AttractionService {
  constructor(
    @InjectModel(Attraction.name) private readonly attractionModel: Model<Attraction>,
  ) { }

  async create(createAttractionDto: CreateAttractionDto): Promise<Attraction> {
    const createdAttraction = new this.attractionModel(createAttractionDto);
    return createdAttraction.save();
  }

  async findAll(): Promise<Attraction[]> {
    return this.attractionModel.find().exec();
  }

  async findOne(id: string): Promise<Attraction> {
    const attraction = await this.attractionModel.findById(id).exec();
    if (!attraction) {
      throw new NotFoundException(`Attraction with ID ${id} not found`);
    }
    return attraction;
  }

  async findByCategory(category: string): Promise<Attraction[]> {
    return this.attractionModel.find({ category }).exec();
  }

  async search(query: string): Promise<Attraction[]> {
    return this.attractionModel.find({
      $or: [
        { attraction_fuzzy: { $regex: query, $options: 'i' } },
        { category_fuzzy: { $regex: query, $options: 'i' } },
        { description_fuzzy: { $regex: query, $options: 'i' } }
      ]
    }).exec();
  }

  async update(id: string, updateAttractionDto: UpdateAttractionDto): Promise<Attraction> {
    const updatedAttraction = await this.attractionModel
      .findByIdAndUpdate(id, updateAttractionDto, { new: true })
      .exec();
    if (!updatedAttraction) {
      throw new NotFoundException(`Attraction with ID ${id} not found`);
    }
    return updatedAttraction;
  }

  async remove(id: string): Promise<Attraction> {
    const deletedAttraction = await this.attractionModel.findByIdAndDelete(id).exec();
    if (!deletedAttraction) {
      throw new NotFoundException(`Attraction with ID ${id} not found`);
    }
    return deletedAttraction;
  }
}
