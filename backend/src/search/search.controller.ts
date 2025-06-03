import { Controller, Post, Body, Get, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchRequestDto, SearchByIdRequestDto } from './dto/search-request.dto';
import { SearchResponseDto } from './dto/search-response.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  @ApiOperation({ summary: '통합 검색' })
  @ApiResponse({ status: HttpStatus.OK, type: SearchResponseDto })
  async search(@Body() dto: SearchRequestDto): Promise<SearchResponseDto> {
    return this.searchService.search(dto);
  }
  @ApiResponse({
    status: HttpStatus.OK,
    description: '검색 결과를 성공적으로 반환했습니다.',
    type: SearchResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '잘못된 요청 파라미터입니다.',
  })

  @Post('restaurantById')
  async searchByIdRestaurant(@Body() searchByIdDto: SearchByIdRequestDto): Promise<SearchResponseDto> {
    return this.searchService.searchByIdRestaurant(searchByIdDto);
  }

   @Post('attractionById')
  async searchByIdAttraction(@Body() searchByIdDto: SearchByIdRequestDto): Promise<SearchResponseDto> {
    return this.searchService.searchByIdAttraction(searchByIdDto);
  }
}

