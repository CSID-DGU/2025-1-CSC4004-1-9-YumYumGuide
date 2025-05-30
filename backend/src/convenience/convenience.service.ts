import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
  private readonly logger = new Logger(ConvenienceService.name);

  constructor(
    @InjectModel(Convenience.name) private readonly convenienceModel: Model<ConvenienceDocument>,
  ) {

  }

  async findOneGoods(_id: string) {
    const goods = await this.convenienceModel.findOne({ _id }).lean();

    if (!goods) {
      throw new NotFoundException('해당 ID의 상품을 찾을 수 없습니다.');
    }

    const item = {
      id: goods._id.toString(),
      nameKr: goods.name,
      nameJp: goods.translatedName || '',
      price: goods.price,
      imageUrl: goods.imageUrl,
      store: goods.category,
    };
    return new ApiResponseDto(true, 200, 'success', item);
  }

  async findOneConvenienceAllGoods(dto: GetConvenienceDto) {
    const { /* category, */ storeType, page, take } = dto;
    const skip = (page - 1) * take;

    const filter: any = {};
    if (storeType) {
      filter.category = storeType;
    }

    this.logger.debug(`[findOneConvenienceAllGoods] Received DTO: ${JSON.stringify(dto)}`);
    this.logger.debug(`[findOneConvenienceAllGoods] Mongoose filter being applied: ${JSON.stringify(filter)}`);

    const [itemsFromDb, totalCount] = await Promise.all([
      this.convenienceModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(take)
        .lean()
        .exec(),
      this.convenienceModel.countDocuments(filter)
    ]);
    
    this.logger.debug(`[findOneConvenienceAllGoods] Found ${totalCount} items with filter. Returning ${itemsFromDb.length} items for page ${page}.`);

    const items = itemsFromDb.map(item => ({
      id: item._id.toString(),
      nameKr: item.name,
      nameJp: item.translatedName || '',
      price: item.price,
      imageUrl: item.imageUrl,
      store: item.category,
    }));

    if (page === 1 && totalCount === 0) {
      const paginatedData = new PaginationResponseDto([], totalCount, page, take);
      this.logger.debug('[findOneConvenienceAllGoods] No items found for the first page, returning specific message.');
      return new ApiResponseDto(true, 200, '해당 조건의 상품을 찾을 수 없습니다.', paginatedData);
    }

    const paginatedData = new PaginationResponseDto(items, totalCount, page, take);
    this.logger.debug('[findOneConvenienceAllGoods] Successfully found items, returning paginated data.');
    return new ApiResponseDto(true, 200, 'success', paginatedData);
  }

  update(id: number, updateConvenienceDto: UpdateConvenienceDto) {
    return `This action updates a #${id} convenience`;
  }

  remove(id: number) {
    return `This action removes a #${id} convenience`;
  }
}
