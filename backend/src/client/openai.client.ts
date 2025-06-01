import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import axios from 'axios';

@Injectable()
export class OpenAIClient {
  private openai: OpenAI;
  private readonly googleMapsApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
    this.googleMapsApiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY')!;
  }

  async generateArticle(
    restaurants: string[],
    touristSpots: string[],
    startDate: string,
    endDate: string,
  ) {
    const systemPrompt = `You are a travel itinerary planner specializing in Tokyo. Create a detailed daily schedule that includes:
    1. Breakfast, lunch, and dinner times
    2. Nearby locations grouped together to minimize travel time
    3. Optimal visiting times for each location
    4. Meal places coordinated with nearby tourist spots
    5. Maximum 3-4 tourist spots per day
    6. Consider operating hours and special considerations
    7. Realistic travel times and distances
    8. Budget considerations`;

    const userPrompt = `Please create a detailed itinerary for Tokyo with the following:
    Restaurants: ${restaurants.join(', ')}
    Tourist Spots: ${touristSpots.join(', ')}
    Travel Period: ${startDate} to ${endDate}
    
    Please format the response in a clear, structured way with daily schedules.`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });
    console.log(completion);
    return completion.choices[0].message.content;
  }

  async getPublicTransportDirections(
    origin: string,
    destination: string,
    departureTime?: string,
  ) {
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/directions/json',
        {
          params: {
            origin,
            destination,
            mode: 'transit',
            departure_time: departureTime || 'now',
            key: this.googleMapsApiKey,
            language: 'ko',
            region: 'jp',
            alternatives: true,
          },
        },
      );

      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API Error: ${response.data.status}`);
      }

      // 경로 정보를 프론트엔드에서 사용하기 쉽게 가공
      const routes = response.data.routes.map(route => ({
        summary: route.summary,
        distance: route.legs[0].distance,
        duration: route.legs[0].duration,
        steps: route.legs[0].steps.map(step => ({
          instruction: step.html_instructions,
          distance: step.distance,
          duration: step.duration,
          travelMode: step.travel_mode,
          transitDetails: step.transit_details ? {
            line: step.transit_details.line,
            departureStop: step.transit_details.departure_stop,
            arrivalStop: step.transit_details.arrival_stop,
            departureTime: step.transit_details.departure_time,
            arrivalTime: step.transit_details.arrival_time,
          } : null,
          polyline: step.polyline.points,
        })),
        overviewPolyline: route.overview_polyline.points,
      }));

      return {
        status: 'OK',
        routes,
      };
    } catch (error) {
      console.error('Error fetching directions:', error);
      throw new Error('Failed to fetch directions: ' + error.message);
    }
  }

  // 예시 사용법
  async getExampleDirections() {
    try {
      // 시부야에서 신주쿠까지의 경로
      const directions = await this.getPublicTransportDirections(
        'Shibuya Station, Tokyo',
        'Shinjuku Station, Tokyo',
        '2024-03-20T10:00:00'
      );

      console.log('=== 도쿄 대중교통 경로 예시 ===');
      console.log('출발지: 시부야역');
      console.log('목적지: 신주쿠역');
      console.log('출발 시간: 2024-03-20 10:00');

      directions.routes.forEach((route, index) => {
        console.log(`\n경로 ${index + 1}:`);
        console.log(`총 거리: ${route.distance.text}`);
        console.log(`예상 소요 시간: ${route.duration.text}`);

        route.steps.forEach((step, stepIndex) => {
          console.log(`\n${stepIndex + 1}단계: ${step.instruction}`);
          if (step.transitDetails) {
            console.log(`- 이용 노선: ${step.transitDetails.line.name}`);
            console.log(`- 출발역: ${step.transitDetails.departureStop.name} (${step.transitDetails.departureTime.text})`);
            console.log(`- 도착역: ${step.transitDetails.arrivalStop.name} (${step.transitDetails.arrivalTime.text})`);
          }
        });
      });

      return directions;
    } catch (error) {
      console.error('경로 조회 중 오류 발생:', error);
      throw error;
    }
  }

  // 다른 예시: 아사쿠사에서 도쿄 스카이트리까지
  async getAnotherExampleDirections() {
    try {
      const directions = await this.getPublicTransportDirections(
        'Asakusa Station, Tokyo',
        'Tokyo Skytree, Tokyo',
        '2024-03-20T14:00:00'
      );

      console.log('=== 도쿄 대중교통 경로 예시 2 ===');
      console.log('출발지: 아사쿠사역');
      console.log('목적지: 도쿄 스카이트리');
      console.log('출발 시간: 2024-03-20 14:00');

      directions.routes.forEach((route, index) => {
        console.log(`\n경로 ${index + 1}:`);
        console.log(`총 거리: ${route.distance.text}`);
        console.log(`예상 소요 시간: ${route.duration.text}`);

        route.steps.forEach((step, stepIndex) => {
          console.log(`\n${stepIndex + 1}단계: ${step.instruction}`);
          if (step.transitDetails) {
            console.log(`- 이용 노선: ${step.transitDetails.line.name}`);
            console.log(`- 출발역: ${step.transitDetails.departureStop.name} (${step.transitDetails.departureTime.text})`);
            console.log(`- 도착역: ${step.transitDetails.arrivalStop.name} (${step.transitDetails.arrivalTime.text})`);
          }
        });
      });

      return directions;
    } catch (error) {
      console.error('경로 조회 중 오류 발생:', error);
      throw error;
    }
  }

  async optimizeSchedule(days: any[]) {
    const systemPrompt = `You are a travel itinerary optimizer specializing in Japan. Your task is to optimize the given schedule while maintaining the exact same structure and format. You should:
    1. CRITICAL: Strictly follow a natural travel flow: Start each day with breakfast, then alternate consistently between activities and meals throughout the day (e.g., Breakfast -> Activity -> Lunch -> Activity -> Dinner).
    2. Optimize the route between locations to minimize travel time
    3. Group nearby locations together to reduce travel time
    4. Consider operating hours of attractions and restaurants
    5. Ensure realistic travel times between locations
    6. Create a realistic schedule that a real person can follow without being too rushed
    7. CRITICAL: Avoid clustering multiple restaurants or multiple attractions consecutively. Ensure a balanced distribution and natural alternation between types.
    8. Consider rest time and meal breaks between activities
    9. If you remove or add any activities, adjust the daily budget accordingly (totalBudget, transportationBudget, foodBudget, activityBudget)
    10. Return the response in the exact same JSON structure as the input
    11. CRITICAL: Your response must be a valid JSON string that can be parsed by JSON.parse(). Do not include any text before or after the JSON. The response should be a single-line JSON without any line breaks, comments, or formatting.
    12. CRITICAL: NO DUPLICATE LOCATIONS ALLOWED. This is the most important rule:
       - Each location (both attractions and restaurants) MUST appear only once in the entire schedule
       - Before returning the response, you MUST check all days to ensure no location is repeated
       - If you find a location in multiple days, keep it only in the most appropriate day and remove it from others
       - This applies to both exact matches and similar locations (e.g., "Tokyo Tower" and "Tokyo Tower Observatory" are considered the same)
       - Double-check your response to ensure this rule is followed`;

    const userPrompt = `Please optimize this schedule while keeping the same structure. Consider the following for route optimization:
    1. CRITICAL: Follow a natural flow, alternating consistently between activities and meals: breakfast -> activity -> lunch -> activity (dinner is optional).
    2. Group nearby locations together
    3. Minimize travel time between locations
    4. Consider public transportation schedules
    5. Make the schedule realistic for a real person to follow
    6. Ensure natural and balanced alternation between restaurants and attractions, avoiding consecutive visits of the same type.
    7. Add appropriate rest time between activities
    8. Adjust daily budgets if you remove or add any activities
    9. CRITICAL: Each location (both attractions and restaurants) MUST be visited only once throughout the entire schedule. This is a strict requirement - do not include the same location on different days. If a location appears in the input schedule multiple times, choose the most appropriate day to visit it and remove it from other days.
    
    Current schedule:
    ${JSON.stringify(days)}
    
    CRITICAL: Your response must be a valid JSON string that can be parsed by JSON.parse(). Return ONLY the JSON object without any additional text, line breaks, or formatting. The response should be a single-line JSON string.`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    try {
      const optimizedSchedule = JSON.parse(content);
      return optimizedSchedule;
    } catch (error) {
      console.error('Error parsing optimized schedule:', error);
      throw new Error('Failed to parse optimized schedule');
    }
  }
}