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
  @ApiOperation({ 
    summary: '통합 검색', 
    description: '음식점과 관광지를 동시에 검색하여 각각 상위 2개씩 반환합니다.' 
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '검색 결과를 성공적으로 반환했습니다.',
    type: SearchResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '잘못된 요청 파라미터입니다.',
  })

  @Get()
  async search(@Body() searchDto: SearchRequestDto): Promise<SearchResponseDto> {
    return this.searchService.search(searchDto);
  }

  @Post('restaurantById')
  async searchByIdRestaurant(@Body() searchByIdDto: SearchByIdRequestDto): Promise<SearchResponseDto> {
    return this.searchService.searchByIdRestaurant(searchByIdDto);
  }

   @Post('attractionById')
  async searchByIdAttraction(@Body() searchByIdDto: SearchByIdRequestDto): Promise<SearchResponseDto> {
    return this.searchService.searchByIdAttraction(searchByIdDto);
  }


  // 혼합 검색어 추천 API
  @Get('suggestions')
  async getSuggestions(
    @Query('q') query: string,
    @Query('limit') limit?: number
  ) {
    if (!query || query.length < 2) {
      return { suggestions: [], categories: [] };
    }
  }

  
}

