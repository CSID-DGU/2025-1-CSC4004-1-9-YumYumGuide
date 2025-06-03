import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchRequestDto {
  //맛집
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  query: string;

  //관광지
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  region: string;
}

export class SearchByIdRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}

