import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Restaurant,
  RestaurantDocument,
  RestaurantModelType,
} from './schemas/restaurant.schema';
import {
  Attraction,
  AttractionDocument,
  AttractionModelType,
} from './schemas/attraction.schema';
import {
  SearchRequestDto,
  SearchByIdRequestDto,
} from './dto/search-request.dto';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
  SearchResponseDto,
  RestaurantSearchResultDto,
  AttractionSearchResultDto,
} from './dto/search-response.dto';

@Injectable()
export class SearchService {
  constructor(
    private readonly es: ElasticsearchService, // Elasticsearch 클라이언트
    @InjectModel(Restaurant.name)
    private restaurantModel: RestaurantModelType,
    @InjectModel(Attraction.name)
    private attractionModel: AttractionModelType,
  ) {}

  /** ------------------------------------------------------------------
   *  통합 검색
   *  1) 음식점 + 관광지 Elasticsearch 검색을 병렬 실행
   *  2) 검색 결과를 별도 정렬 함수로 점수 계산
   *  3) 각 상위 2개씩 반환
   * ------------------------------------------------------------------*/
  async search(searchDto: SearchRequestDto): Promise<SearchResponseDto> {
    const startTime = Date.now();
    const { query, region } = searchDto;

    // ① 음식점 · 관광지 검색을 병렬 실행
    const [restaurantResults, attractionResults] = await Promise.all([
      this.searchRestaurants({ query, region }),
      this.searchAttractions({ query, region }),
    ]);

    // ② 검색 결과를 정확도(계산 점수) 순으로 정렬 후 상위 2개 선택
    const topRestaurants = this.sortByRelevanceRestaurant(
      restaurantResults,
      query,
    ).slice(0, 2);
    const topAttractions = this.sortByRelevanceAttraction(
      attractionResults,
      query,
    ).slice(0, 2);

    return {
      restaurants: topRestaurants.map(r => this.mapToRestaurantDto(r)),
      attractions: topAttractions.map(a => this.mapToAttractionDto(a)),
      totalCount: {
        restaurants: restaurantResults.length,
        attractions: attractionResults.length,
      },
      searchInfo: {
        query,
        region,
        searchTime: Date.now() - startTime,
      },
    };
  }

  /** ------------------------------------------------------------------
   *  ID 단일 조회 (MongoDB 직접 조회)
   * ------------------------------------------------------------------*/
  async searchByIdRestaurant(
    dto: SearchByIdRequestDto,
  ): Promise<SearchResponseDto> {
    const { id } = dto;
    const [doc] = await this.restaurantModel
      .find({ _id: new Types.ObjectId(id) })
      .exec();

    return {
      restaurants: [{ data: doc }],
      attractions: [],
      totalCount: { restaurants: 1, attractions: 0 },
      searchInfo: { query: id, region: 'id 검색', searchTime: 0 },
    };
  }

  async searchByIdAttraction(
    dto: SearchByIdRequestDto,
  ): Promise<SearchResponseDto> {
    const { id } = dto;
    const [doc] = await this.attractionModel
      .find({ _id: new Types.ObjectId(id) })
      .exec();

    return {
      restaurants: [],
      attractions: [{ data: doc }],
      totalCount: { restaurants: 0, attractions: 1 },
      searchInfo: { query: id, region: 'id 검색', searchTime: 0 },
    };
  }

  /** ------------------------------------------------------------------
   *  Elasticsearch 음식점 검색
   *  - bool_prefix (접두어) + n-gram(infix) 조합
   * ------------------------------------------------------------------*/
  private async searchRestaurants(q: {
    query: string;
    region: string;
  }): Promise<RestaurantDocument[]> {
    const { hits } = await this.es.search({
      index: 'restaurants',
      size: 10,
      query: {
        bool: {
          must: [{ term: { region: q.region } }], // 지역 필터
          should: [
            // (1) 접두어 자동완성
            {
              multi_match: {
                query: q.query,
                type: 'bool_prefix',
                fields: [
                  'translated_restaurant_name.autocomplete',
                  'translated_restaurant_name.autocomplete._2gram',
                  'translated_restaurant_name.autocomplete._3gram',
                ],
                boost: 3,
              },
            },
            // (2) 중간(infix) n-gram
            {
              match: {
                'translated_restaurant_name.infix': {
                  query: q.query,
                  operator: 'and',
                  boost: 1,
                },
              },
            },
          ],
          minimum_should_match: 1,
        },
      },
      _source: { excludes: ['*.infix', '*.autocomplete*'] },
    });

    // ES 결과를 Mongo 문서 형태로 래핑
    return hits.hits.map(h => {
      const src = h._source as any;
      return {
        restaurant_name: src.translated_restaurant_name,
        genre: src.genre,
        translated_restaurant_name: src.translated_restaurant_name,
        _doc: src,
        calculatedScore: h._score ?? 0, // 정렬 함수에서 덮어씀
      } as unknown as RestaurantDocument;
    });
  }

  /** ------------------------------------------------------------------
   *  Elasticsearch 관광지 검색
   * ------------------------------------------------------------------*/
  private async searchAttractions(q: {
    query: string;
    region: string;
  }): Promise<AttractionDocument[]> {
    const { hits } = await this.es.search({
      index: 'attractions',
      size: 10,
      query: {
        bool: {
          must: [{ term: { region: q.region } }],
          should: [
            {
              multi_match: {
                query: q.query,
                type: 'bool_prefix',
                fields: [
                  'attraction.autocomplete',
                  'attraction.autocomplete._2gram',
                  'attraction.autocomplete._3gram',
                ],
                boost: 3,
              },
            },
            {
              match: {
                'attraction.infix': {
                  query: q.query,
                  operator: 'and',
                  boost: 1,
                },
              },
            },
          ],
          minimum_should_match: 1,
        },
      },
      _source: { excludes: ['*.infix', '*.autocomplete*'] },
    });

    return hits.hits.map(h => {
      const src = h._source as any;
      return {
        attraction: src.attraction,
        description: src.description,
        _doc: src,
        calculatedScore: h._score ?? 0,
      } as unknown as AttractionDocument;
    });
  }

  /* ------------------------------------------------------------------
   *  정렬 로직
   *  ─ 이름/장르/설명에 키워드가 포함되면 가산점,
   *    이름이 완전 일치하면 최고 점수 부여
   * ------------------------------------------------------------------*/
  private sortByRelevanceRestaurant<
    T extends {
      restaurant_name: string;
      genre: string;
      translated_restaurant_name: string;
    },
  >(results: T[], keyword: string): (T & { calculatedScore: number })[] {
    return results
      .map(item => ({
        ...item,
        calculatedScore: this.calculateRelevanceScoreRestaurant(
          item,
          keyword,
        ),
      }))
      .sort((a, b) => b.calculatedScore - a.calculatedScore);
  }

  private sortByRelevanceAttraction<
    T extends { attraction: string; description: string },
  >(results: T[], keyword: string): (T & { calculatedScore: number })[] {
    return results
      .map(item => ({
        ...item,
        calculatedScore: this.calculateRelevanceScoreAttraction(item, keyword),
      }))
      .sort((a, b) => b.calculatedScore - a.calculatedScore);
  }

  /** 이름·장르 점수 계산 */
  private calculateRelevanceScoreRestaurant(
    item: { restaurant_name: string; genre: string },
    keyword: string,
  ): number {
    const lowerKeyword = keyword.toLowerCase();
    const lowerName = item.restaurant_name?.toLowerCase() ?? '';
    const lowerGenre = item.genre?.toLowerCase() ?? '';

    let score = 0;

    // ─ 이름에 키워드 포함 → +50
    if (lowerName.includes(lowerKeyword)) {
      score += 50;

      // ─ 이름이 완전히 일치 → +100
      if (lowerName === lowerKeyword) score += 100;
    }

    // ─ 장르에 키워드 포함 → +50
    if (lowerGenre.includes(lowerKeyword)) score += 50;

    return score;
  }

  /** 명소 점수 계산 */
  private calculateRelevanceScoreAttraction(
    item: { attraction: string; description: string },
    keyword: string,
  ): number {
    const lowerKeyword = keyword.toLowerCase();
    const lowerName = item.attraction?.toLowerCase() ?? '';
    const lowerDesc = item.description?.toLowerCase() ?? '';

    let score = 0;

    // ─ 이름 포함 → +100
    if (lowerName.includes(lowerKeyword)) score += 100;

    // ─ 설명 포함 → +30
    if (lowerDesc.includes(lowerKeyword)) score += 30;

    return score;
  }

  /** Mongo→클라이언트 DTO 매핑 */
  private mapToRestaurantDto(r): RestaurantSearchResultDto {
    return { data: r._doc, sort: r.calculatedScore || 0 };
  }
  private mapToAttractionDto(a): AttractionSearchResultDto {
    return { data: a._doc, sort: a.calculatedScore || 0 };
  }

  /* ------------------------------------------------------------------
   *  (참고) MongoDB 기반 자동완성 / 장르 추천
   * ------------------------------------------------------------------*/
  async getAutocompleteSuggestions(
    query: string,
    limit = 10,
  ): Promise<string[]> {
    if (query.length < 2) return [];

    const suggestions = new Set<string>();

    // 음식점 이름
    const R = await this.restaurantModel
      .find({ restaurant_name: { $regex: query, $options: 'i' } })
      .select('translated_restaurant_name')
      .limit(limit / 2);

    // 관광지 이름
    const A = await this.attractionModel
      .find({ attraction: { $regex: query, $options: 'i' } })
      .select('attraction')
      .limit(limit / 2);

    R.forEach(d => suggestions.add(d.restaurant_name));
    A.forEach(d => suggestions.add(d.attraction));

    return Array.from(suggestions)
      .sort((a, b) => {
        const as = a.toLowerCase().startsWith(query.toLowerCase());
        const bs = b.toLowerCase().startsWith(query.toLowerCase());
        if (as && !bs) return -1;
        if (!as && bs) return 1;
        return a.length - b.length;
      })
      .slice(0, limit);
  }

  /** 장르/카테고리 추천 */
  async getGenreSuggestions(query: string, limit = 5): Promise<string[]> {
    if (query.length < 2) return [];
    const list = await this.restaurantModel
      .distinct('genre', { genre: { $regex: query, $options: 'i' } })
      .limit(limit);
    return list.filter(g => g?.toLowerCase().includes(query.toLowerCase()));
  }
}
