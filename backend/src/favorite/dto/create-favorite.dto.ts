import { IsNumber, IsArray, IsEnum, IsNotEmpty, IsOptional, ArrayMinSize, ArrayMaxSize, IsIn, IsString } from 'class-validator';

export class CreateFavoriteDto {
  // @IsString()  // userId 관련 필드 주석 처리 또는 삭제
  // @IsNotEmpty()
  // userId: string;

  @IsEnum([1, 0])
  @IsNotEmpty()
  @IsNumber()
  smoking: number;

  @IsEnum([1, 0])
  @IsNotEmpty()
  @IsNumber()
  drinking: number;

  @IsEnum([0, 1])
  @IsNotEmpty()
  @IsNumber()
  travelStyle: number;

  @IsEnum([0, 1, 2, 3])
  @IsNotEmpty()
  @IsNumber()
  favoriteFood: number;

  @IsEnum([0, 1])
  @IsNotEmpty()
  @IsNumber()
  groupType: number;

  @IsArray()
  @ArrayMinSize(1, { message: '관광지 유형은 최소 1개 선택해야 합니다.' })
  @ArrayMaxSize(2, { message: '관광지 유형은 최대 2개까지 선택할 수 있습니다.' })
  @IsIn(['자연', '축제', '역사', '액티비티', '랜드마크'], { each: true, message: '잘못된 관광지 유형 값입니다.' })
  @IsString({ each: true })
  attractionType: string[];
}
