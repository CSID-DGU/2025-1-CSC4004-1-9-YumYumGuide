import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';
export class RestaurantSearchResultDto {
  // 필수 데이터만 따로 빼기

  // @ApiProperty()
  // _id: string;

  // @ApiProperty()
  // name: string;

  // @ApiProperty()
  // genre: string;

  // @ApiProperty()
  // tel: string;
  
  // @ApiProperty()
  // address: string;
  
  // @ApiProperty()
  // lunchBudget: string; // 이거 비어있을 수도 있는데 어카지

  // @ApiProperty()
  // dinnerBudget: string; // Budget을 trim()?같은 거 해서 토큰화해갖고 숫자로 바꾸고 싶다

  // @ApiProperty()
  // budget: string; // budget을 lunch/dinner로 나누고 싶다ㅜ

  // @ApiProperty()
  // wifi: boolean;

  @IsObject()
  @IsOptional() 
  data?: Record<string, any>;

  @ApiProperty({
    description: '검색 정확도 점수 (내부 로직에 의해 부여)',
    example: 0.92,
    required: false, // 이 필드는 보통 검색 결과에 동적으로 할당됩니다.
  })
  sort?: number;

}
export class AttractionSearchResultDto {
  // @ApiProperty()
  // _id: string;

  // @ApiProperty()
  // name: string;

  // @ApiProperty()
  // description: string;


  // @ApiProperty()
  // address: string;

  // @ApiProperty()
  // category: string;

  @IsObject()
  @IsOptional() 
  data?: Record<string, any>;

  @ApiProperty({
    description: '검색 정확도 점수 (내부 로직에 의해 부여)',
    example: 0.92,
    required: false, // 이 필드는 보통 검색 결과에 동적으로 할당됩니다.
  })
  sort?: number;

}

export class SearchResponseDto {
  @ApiProperty({ type: [RestaurantSearchResultDto] })
  restaurants: RestaurantSearchResultDto[];

  @ApiProperty({ type: [AttractionSearchResultDto] })
  attractions: AttractionSearchResultDto[];

  @ApiProperty()
  totalCount: {
    restaurants: number;
    attractions: number;
  };

  @ApiProperty()
  searchInfo: {
    query: string;
    region: string;
    searchTime: number; // 검색 소요 시간(ms)
  };
}