import { Controller, Post, Body, Get, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchRequestDto } from './dto/search-request.dto';
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
  async search(@Body() searchDto: SearchRequestDto): Promise<SearchResponseDto> {
    return this.searchService.search(searchDto);
  }

  @Get('popular-keywords')
  @ApiOperation({ 
    summary: '지역별 인기 검색어 조회', 
    description: '특정 지역의 인기 검색어 목록을 반환합니다.' 
  })
  @ApiQuery({
    name: 'region',
    required: true,
    description: '검색할 지역명',
    example: '서울'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '인기 검색어 목록을 성공적으로 반환했습니다.',
    schema: {
      type: 'object',
      properties: {
        region: { type: 'string', example: '서울' },
        keywords: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['맛집', '카페', '박물관', '공원', '쇼핑']
        }
      }
    }
  })
  async getPopularKeywords(
    @Query('region') region: string
  ): Promise<{ region: string; keywords: string[] }> {
    const keywords = await this.searchService.getPopularKeywordsByRegion(region);
    return {
      region,
      keywords
    };
  }

  // @Get('suggestions')
  // @ApiOperation({
  //   summary: '검색어 자동완성',
  //   description: '입력된 키워드를 기반으로 검색어 추천 목록을 반환합니다.'
  // })
  // @ApiQuery({
  //   name: 'keyword',
  //   required: true,
  //   description: '자동완성할 키워드',
  //   example: '맛'
  // })
  // @ApiQuery({
  //   name: 'region',
  //   required: false,
  //   description: '지역 필터 (선택사항)',
  //   example: '서울'
  // })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: '검색어 추천 목록을 성공적으로 반환했습니다.',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       suggestions: {
  //         type: 'array',
  //         items: {
  //           type: 'object',
  //           properties: {
  //             text: { type: 'string' },
  //             type: { type: 'string', enum: ['restaurant', 'attraction'] },
  //             count: { type: 'number' }
  //           }
  //         }
  //       }
  //     }
  //   }
  // })
  // async getSearchSuggestions(
  //   @Query('keyword') keyword: string,
  //   @Query('region') region?: string
  // ): Promise<{ suggestions: Array<{ text: string; type: string; count: number }> }> {
  //   const suggestions = await this.searchService.getSearchSuggestions(keyword, region);
  //   return { suggestions };
  // }

  // @Get('regions')
  // @ApiOperation({
  //   summary: '검색 가능한 지역 목록',
  //   description: '검색 가능한 모든 지역 목록을 반환합니다.'
  // })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: '지역 목록을 성공적으로 반환했습니다.',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       regions: {
  //         type: 'array',
  //         items: {
  //           type: 'object',
  //           properties: {
  //             name: { type: 'string' },
  //             count: {
  //               type: 'object',
  //               properties: {
  //                 restaurants: { type: 'number' },
  //                 attractions: { type: 'number' }
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  // })
  // async getAvailableRegions(): Promise<{
  //   regions: Array<{
  //     name: string;
  //     count: { restaurants: number; attractions: number };
  //   }>;
  // }> {
  //   const regions = await this.searchService.getAvailableRegions();
  //   return { regions };
  // }

  // @Post('advanced')
  // @ApiOperation({
  //   summary: '고급 검색',
  //   description: '더 세부적인 필터를 적용한 고급 검색을 수행합니다.'
  // })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: '고급 검색 결과를 성공적으로 반환했습니다.',
  //   type: SearchResponseDto,
  // })
  // async advancedSearch(@Body() searchDto: AdvancedSearchRequestDto): Promise<SearchResponseDto> {
  //   return this.searchService.advancedSearch(searchDto);
  // }
}

