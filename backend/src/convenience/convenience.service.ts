import { Injectable } from '@nestjs/common';
import { CreateConvenienceDto } from './dto/create-convenience.dto';
import { UpdateConvenienceDto } from './dto/update-convenience.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Convenience, ConvenienceDocument } from './schema/convenience.schema';
import { Model } from 'mongoose';
import { ApiResponseDto, PaginationResponseDto } from 'src/common/dto/api.response.dto';
import { ConvenienceCategory } from './enums/convenience-category.enum';
import { GetConvenienceDto } from './dto/get-conveneience.dto';

@Injectable()
export class ConvenienceService {
  constructor(
    @InjectModel(Convenience.name) private readonly convenienceModel: Model<ConvenienceDocument>,
  ) {

  }

  async findOneGoods(_id: string) {
    const goods = await this.convenienceModel.findOne({ _id });

    if (!goods) {
      return new ApiResponseDto(false, 404, 'not found', null);
    }

    return new ApiResponseDto(true, 200, 'success', goods);
  }

  async findOneConvenienceAllGoods(dto: GetConvenienceDto) {
    const { category, page, take } = dto;
    const skip = (page - 1) * take;

    const [items, totalCount] = await Promise.all([
      this.convenienceModel
        .find({ category })
        .skip(skip)
        .limit(take)
        .exec(),
      this.convenienceModel.countDocuments({ category })
    ]);

    if (!items.length) {
      return new ApiResponseDto(false, 404, 'not found', null);
    }

    const paginatedData = new PaginationResponseDto(items, totalCount, page, take);
    return new ApiResponseDto(true, 200, 'success', paginatedData);
  }

  update(id: number, updateConvenienceDto: UpdateConvenienceDto) {
    return `This action updates a #${id} convenience`;
  }

  remove(id: number) {
    return `This action removes a #${id} convenience`;
  }
}
