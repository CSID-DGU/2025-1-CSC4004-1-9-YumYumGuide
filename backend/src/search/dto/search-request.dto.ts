import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchRequestDto {
  @ApiProperty({ 
    example: '맛집', 
    description: '검색할 키워드' 
  })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiProperty({ 
    example: '서울', 
    description: '검색할 지역' 
  })
  @IsString()
  @IsNotEmpty()
  region: string;
}
