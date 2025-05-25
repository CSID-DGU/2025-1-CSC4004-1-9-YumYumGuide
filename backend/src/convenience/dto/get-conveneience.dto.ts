import { IsEnum } from "class-validator";
import { ConvenienceCategory } from "../enums/convenience-category.enum";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class GetConvenienceDto extends PaginationDto {

  @IsEnum(ConvenienceCategory)
  category: string;


}
