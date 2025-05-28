import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Restaurant, RestaurantDocument } from './schemas/restaurant.schema';
import { Attraction, AttractionDocument } from './schemas/attraction.schema';
import { SearchRequestDto } from './dto/search-request.dto';
import { 
  SearchResponseDto, 
  RestaurantSearchResultDto, 
  AttractionSearchResultDto 
} from './dto/search-response.dto';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    @InjectModel(Attraction.name) private attractionModel: Model<AttractionDocument>,
  ) {}

  async search(searchDto: SearchRequestDto): Promise<SearchResponseDto> {
    const startTime = Date.now();
    const { query, region } = searchDto;

    // MongoDB 텍스트 검색 쿼리 구성
    const searchQuery = this.buildSearchQuery(query, region);

    // 병렬로 음식점과 관광지 검색 실행
    const [restaurantResults, attractionResults] = await Promise.all([
      this.searchRestaurants(searchQuery),
      this.searchAttractions(searchQuery),
    ]);

    // console.log(restaurantResults)

    // 검색 결과를 정확도 순으로 정렬하고 상위 2개 선택
    const topRestaurants = this.sortByRelevanceRestaurant(restaurantResults, query).slice(0, 2);
    const topAttractions = this.sortByRelevanceAttraction(attractionResults, query).slice(0, 2);

    const searchTime = Date.now() - startTime;

    return {
      restaurants: topRestaurants.map(restaurant => this.mapToRestaurantDto(restaurant)),
      attractions: topAttractions.map(attraction => this.mapToAttractionDto(attraction)),
      totalCount: {
        restaurants: restaurantResults.length,
        attractions: attractionResults.length,
      },
      searchInfo: {
        query,
        region,
        searchTime,
      },
    };
  }

  private buildSearchQuery(query: string, region: string) {
    const mongoQuery: any = {
        // { region: { $regex: region, $options: 'i' } },
        // isActive: true,
        $text: { $search: query }
    };

    console.log(mongoQuery);

    return mongoQuery;
  }

  private async searchRestaurants(query: any): Promise<RestaurantDocument[]> {
    return this.restaurantModel
      .find(query, {
        score: { $meta: 'textScore' }
      })
      .sort({ score: { $meta: 'textScore' }, rating: -1 })
      .limit(10)
      .exec();
  }

  private async searchAttractions(query: any): Promise<AttractionDocument[]> {
    return this.attractionModel
      .find(query, {
        score: { $meta: 'textScore' }
      })
      .sort({ score: { $meta: 'textScore' }, rating: -1 })
      .limit(10)
      .exec();
  }

  private sortByRelevanceRestaurant<T extends { restaurant_name: string; genre: string }>(
    results: T[], 
    keyword: string
  ): (T & { calculatedScore: number })[] {
    return results
      .map(item => ({
        ...item,
        calculatedScore: this.calculateRelevanceScoreRestaurant(item, keyword),
      }))
      .sort((a, b) => b.calculatedScore - a.calculatedScore);
  }

  private sortByRelevanceAttraction<T extends { attraction: string; description: string }>(
    results: T[], 
    keyword: string
  ): (T & { calculatedScore: number })[] {
    return results
      .map(item => ({
        ...item,
        calculatedScore: this.calculateRelevanceScoreAttraction(item, keyword),
      }))
      .sort((a, b) => b.calculatedScore - a.calculatedScore);
  }

  private calculateRelevanceScoreRestaurant(
    item: { restaurant_name: string; genre: string}, 
    keyword: string
  ): number {
    const lowerKeyword = keyword.toLowerCase();
    const lowerName = item.restaurant_name?.toLowerCase() || "";
    const lowerDescription = item.genre?.toLowerCase() || "";

    console.log(`q: ${lowerKeyword}\nn: ${lowerName}\nd:${lowerDescription}`)

    let score = 0;

    // 이름에 키워드가 포함된 경우 높은 점수
    if (lowerName.includes(lowerKeyword)) {
      score += 100;
      // 이름이 키워드로 시작하는 경우 추가 점수
      if (lowerName.startsWith(lowerKeyword)) {
        score += 50;
      }
      // 이름과 키워드가 정확히 일치하는 경우 최고 점수
      if (lowerName === lowerKeyword) {
        score += 100;
      }
    }

    // 설명에 키워드가 포함된 경우
    if (lowerDescription.includes(lowerKeyword)) {
      score += 30;
    }

    // 평점을 점수에 반영 (최대 25점)
    // score += (item.rating || 0) * 5;

    return score;
  }

  private calculateRelevanceScoreAttraction(
    item: { attraction: string; description: string}, 
    keyword: string
  ): number {
    const lowerKeyword = keyword.toLowerCase();
    const lowerName = item.attraction?.toLowerCase()  || "";
    const lowerDescription = item.description?.toLowerCase()  || "";

    console.log(`q: ${lowerKeyword}\nn: ${lowerName}\nd:${lowerDescription}`)

    let score = 0;

    // 이름에 키워드가 포함된 경우 높은 점수
    if (lowerName.includes(lowerKeyword)) {
      score += 100;
      // 이름이 키워드로 시작하는 경우 추가 점수
      if (lowerName.startsWith(lowerKeyword)) {
        score += 50;
      }
      // 이름과 키워드가 정확히 일치하는 경우 최고 점수
      if (lowerName === lowerKeyword) {
        score += 100;
      }
    }

    // 설명에 키워드가 포함된 경우
    if (lowerDescription.includes(lowerKeyword)) {
      score += 30;
    }

    // 평점을 점수에 반영 (최대 25점)
    // score += (item.rating || 0) * 5;

    return score;
  }

  private mapToRestaurantDto(restaurant): RestaurantSearchResultDto {
    return {
      // _id: d_restaurant._id.toString(),
      // name: d_restaurant.restaurant_name,
      // genre: d_restaurant.genre,
      // lunchBudget: d_restaurant.lunchBudget,
      // dinnerBudget: d_restaurant.dinnerBudget,
      // budget: d_restaurant.budget,
      // wifi: d_restaurant.wifi,
      // address: d_restaurant.address,
      // tel: d_restaurant.tel,
      data: restaurant._doc,
      sort: restaurant.calculatedScore || 0,
    };
  }

  private mapToAttractionDto(attraction): AttractionSearchResultDto {
    return {
      data: attraction._doc,
      sort: attraction.calculatedScore || 0,
    };
  }

  // 지역별 인기 검색어 조회
  async getPopularKeywordsByRegion(region: string): Promise<string[]> {
    // 실제로는 검색 로그를 분석해서 인기 키워드를 반환
    // 여기서는 예시 데이터 반환
    const popularKeywords = {
      '서울': ['맛집', '카페', '박물관', '공원', '쇼핑'],
      '부산': ['해변', '횟집', '시장', '온천', '전망대'],
      '제주': ['흑돼지', '카페', '해변', '박물관', '오름'],
    };

    return popularKeywords[region] || ['맛집', '관광지', '카페'];
  }
}
