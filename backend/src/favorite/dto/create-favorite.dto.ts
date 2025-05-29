import { IsString, IsArray, IsEnum, IsNotEmpty, IsOptional, ArrayMinSize, ArrayMaxSize, IsIn } from 'class-validator';

export class CreateFavoriteDto {
  // @IsString()  // userId 관련 필드 주석 처리 또는 삭제
  // @IsNotEmpty()
  // userId: string;

  @IsEnum(['흡연함', '흡연 안 함'])
  @IsNotEmpty()
  smoking: string;

  @IsEnum(['음주함', '음주 안 함'])
  @IsNotEmpty()
  drinking: string;

  @IsEnum(['맛집 위주', '관광지 위주'])
  @IsNotEmpty()
  travelStyle: string;

  @IsEnum(['육류', '해산물', '면류', '밥류'])
  @IsNotEmpty()
  favoriteFood: string;

  @IsArray()
  @IsString({ each: true })
  @IsEnum(['견과류', '해산물', '유제품', '밀가루'], { each: true })
  @IsOptional()
  hateFood: string[];

  @IsEnum(['1인&2인', '3인 이상'])
  @IsNotEmpty()
  groupType: string;

  @IsArray()
  @ArrayMinSize(1, { message: '관광지 유형은 최소 1개 선택해야 합니다.' })
  @ArrayMaxSize(2, { message: '관광지 유형은 최대 2개까지 선택할 수 있습니다.' })
  @IsIn(['자연', '축제', '역사', '액티비티', '랜드마크'], { each: true, message: '잘못된 관광지 유형 값입니다.' })
  @IsString({ each: true })
  attractionType: string[];
}
