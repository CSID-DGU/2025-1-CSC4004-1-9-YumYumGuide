import { IsEnum, IsOptional, IsString } from "class-validator";
import { ConvenienceCategory } from "../enums/convenience-category.enum";
import { PaginationDto } from "src/common/dto/pagination.dto";

// 편의점 종류를 위한 Enum (키와 값을 모두 소문자로 통일)
export enum StoreType {
  familymart = 'familymart', 
  seveneleven = 'seveneleven', 
  lawson = 'lawson', // 로손 추가
  // cu = 'cu', 
  // gs25 = 'gs25',
}

export class GetConvenienceDto extends PaginationDto {

  @IsOptional()
  @IsEnum(ConvenienceCategory)
  category?: string; // 기존 category 필드는 선택적으로 변경

  @IsOptional()
  @IsString()
  @IsEnum(StoreType) // StoreType Enum 사용
  storeType?: StoreType; // 필드명 storeType으로 변경 및 Enum 적용
}
