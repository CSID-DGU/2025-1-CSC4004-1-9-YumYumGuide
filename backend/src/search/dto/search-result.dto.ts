import { ApiProperty } from '@nestjs/swagger';

export class SearchResultItemDto {
  @ApiProperty({ description: '검색 결과 항목의 ID' })
  _id: string;

  @ApiProperty({ description: '검색 결과 항목의 타입 (랜드마크 또는 음식점)', enum: ['랜드마크', '음식점'] })
  type: '랜드마크' | '음식점';

  @ApiProperty({ description: '검색 결과 항목의 제목' })
  title: string;

  @ApiProperty({ description: '검색 결과 항목의 설명' })
  description: string;

  @ApiProperty({ description: '검색 결과 항목의 이미지 URL' })
  image: string;

  @ApiProperty({ description: '검색 점수' })
  score: number;
}

export class SearchResultDto {
  @ApiProperty({ type: [SearchResultItemDto], description: '페이지네이션된 검색 결과' })
  paginatedResults: SearchResultItemDto[];

  @ApiProperty()
  totalCount: { count: number }[];
} 