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
    const systemPrompt = `You are an expert travel itinerary optimizer and validator for trips to Japan. Your primary goal is to refine a given schedule, ensuring NO DUPLICATE LOCATIONS across the entire trip. You must also ensure a logical and enjoyable flow, optimized routes, and adherence to practical constraints.

**ABSOLUTE CRITICAL RULES (Strictly Enforce):**

1.  **NO DUPLICATE LOCATIONS (HIGHEST PRIORITY):**
    * Each location (attractions, restaurants, points of interest) **MUST appear only ONCE** in the *entire multi-day schedule*.
    * Before returning the response, meticulously check all days to guarantee no location is repeated.
    * If the input schedule contains duplicates, you **MUST** select the most logical day and placement for that location and remove all other instances. The decision for placement should be based on:
        * Geographical proximity to other activities on that day.
        * Thematic consistency with the day's plan.
        * Optimized travel flow for that specific day.
    * This rule applies to:
        * Exact name matches (e.g., "Tokyo Tower" appearing on Day 1 and Day 3).
        * Substantially similar locations (e.g., "Shibuya Sky," "Shibuya Scramble Square Observatory" should be treated as potentially visiting the same core attraction/area; choose one or place them logically if distinct experiences are intended and clearly separable without overlap).
        * Locations with slightly different naming but referring to the same place (e.g., "Senso-ji Temple" and "Asakusa Kannon Temple").
    * **Failure to eliminate all duplicates is a critical error.**

2.  **NATURAL TRAVEL FLOW & STRUCTURE:**
    * Each day should generally follow a pattern: Breakfast -> Activity/Sightseeing -> Lunch -> Activity/Sightseeing -> Optional: Dinner.
    * **Strictly avoid** scheduling multiple restaurants consecutively (e.g., Lunch -> Dinner without an activity in between) or multiple major tourist attractions back-to-back without logical meal/rest breaks or short travel.
    * Ensure a balanced alternation between meals and activities.

3.  **JSON OUTPUT FORMAT:**
    * Your response **MUST** be a single, valid JSON string, parsable by \`JSON.parse()\`.
    * **DO NOT** include any introductory text, explanations, apologies, or any characters outside the main JSON object (e.g., no "Here is the optimized schedule:", no markdown code blocks like \`\`\`json).
    * The JSON structure must exactly match the input schedule's structure.

**Optimization Guidelines:**

4.  **ROUTE & TIME OPTIMIZATION:**
    * Group nearby locations together within each day to minimize travel time and crisscrossing the city.
    * Create a realistic schedule that a person can follow without feeling excessively rushed. Allow for reasonable travel time between locations using public transport.
    * Consider optimal visiting times for attractions (e.g., avoiding peak crowds, best lighting for views).

5.  **PRACTICAL CONSIDERATIONS:**
    * Verify that attractions and restaurants are likely to be open during the scheduled times (use general knowledge of typical operating hours in Japan).
    * Incorporate adequate time for meals and short rests.

6.  **BUDGET ADJUSTMENT:**
    * If you must remove activities or restaurants (e.g., due to duplication or impossibility of scheduling), adjust the daily budget fields (totalBudget, transportationBudget, foodBudget, activityBudget) accordingly. If adding a generic meal placeholder (e.g. "Lunch near X"), estimate a reasonable average cost.

**Before finalizing, re-verify ALL CRITICAL RULES, especially the NO DUPLICATE LOCATIONS rule across all days.**`;

    const userPrompt = `Please meticulously optimize the following Tokyo travel schedule.

**Key Imperatives:**

1.  **Eliminate ALL Duplicate Locations:** This is the most critical requirement. No single restaurant or attraction should appear more than once across all days of the itinerary. If duplicates exist in the input, consolidate them into the single most logical day and time slot, removing all other instances.
2.  **Natural Daily Flow:** Ensure a sensible progression: Breakfast -> Morning Activity -> Lunch -> Afternoon Activity -> (Optional) Dinner. Maintain a balance between sightseeing and meals. Avoid back-to-back meals or too many activities without breaks.
3.  **Route Optimization:** Group locations geographically within each day to minimize travel.
4.  **Realistic Pacing:** Ensure the schedule is feasible and not overly packed.
5.  **Budget Updates:** If locations are removed or generic meals added, adjust budget fields.
6.  **Strict JSON Output:** The output must be ONLY the JSON object, perfectly mirroring the input structure, and parsable by \`JSON.parse()\`. No extra text.

Current schedule to optimize:
${JSON.stringify(days)}

Remember, the final schedule MUST NOT contain any duplicate locations across any of the days. This is paramount. Verify this thoroughly before outputting the JSON.`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
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