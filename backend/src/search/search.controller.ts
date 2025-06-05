import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResultDto } from './dto/search-result.dto';
import { ApiResponseDto } from '../common/api.response.dto/api.response.dto';

@ApiTags('검색')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) { }

  @Get()
  @ApiOperation({ summary: '통합 검색', description: '랜드마크와 음식점을 동시에 검색합니다.' })
  @ApiResponse({
    status: 200,
    description: '검색 성공',
    type: SearchResultDto
  })
  async search(@Query() searchQueryDto: SearchQueryDto): Promise<ApiResponseDto<SearchResultDto>> {
    const result = await this.searchService.search(
      searchQueryDto.query,
      searchQueryDto.location,
      searchQueryDto.page,
      searchQueryDto.pageSize
    );
    return new ApiResponseDto(true, 200, '검색이 완료되었습니다.', result);
  }
} 