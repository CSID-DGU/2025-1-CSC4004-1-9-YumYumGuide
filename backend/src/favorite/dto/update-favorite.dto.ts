import { IsNumber, IsArray, IsEnum, IsOptional, ArrayMinSize, ArrayMaxSize, IsIn, IsString } from 'class-validator';

export class UpdateFavoriteDto {
  @IsEnum([1, 0])
  @IsOptional()
  @IsNumber()
  smoking?: number;

  @IsEnum([1, 0])
  @IsOptional()
  @IsNumber()
  drinking?: number;

  @IsEnum(['맛집 위주', '관광지 위주'])
  @IsOptional()
  @IsString()
  travelStyle?: string;

  @IsEnum(['육류', '해산물', '면류', '밥류'])
  @IsOptional()
  @IsString()
  favoriteFood?: string;

  @IsEnum(['1인&2인', '3인 이상'])
  @IsOptional()
  @IsString()
  groupType?: string;

  @IsArray()
  @ArrayMinSize(1, { message: '관광지 유형은 최소 1개 선택해야 합니다.' })
  @ArrayMaxSize(2, { message: '관광지 유형은 최대 2개까지 선택할 수 있습니다.' })
  @IsIn(['자연', '축제', '역사', '액티비티', '랜드마크'], { each: true, message: '잘못된 관광지 유형 값입니다.' })
  @IsString({ each: true })
  @IsOptional()
  attractionType?: string[];
}
