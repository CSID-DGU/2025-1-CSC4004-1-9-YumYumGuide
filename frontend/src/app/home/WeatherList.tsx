"use client";

import React, { useState, useEffect } from 'react';

// 날씨 카드 속성 인터페이스 (상단으로 이동)
interface WeatherCardProps {
  time: string;
  icon: {
    type: 'rain' | 'cloud' | 'sun' | 'snow';
  };
  temperature: string;
}

// 기본 날씨 데이터 (API 호출 전 보여줄 초기 데이터)
const defaultWeather: WeatherCardProps[] = Array(10).fill(null).map((_, index) => ({
  time: `${index + 1}시간 후`,
  icon: { type: 'cloud' },
  temperature: '--°'
}));

// 날씨 아이콘 타입 정의
type WeatherIconType = 'rain' | 'cloud' | 'sun' | 'snow';

// 날씨 아이콘 인터페이스
interface WeatherIcon {
  type: WeatherIconType;
}

// 날씨 카드 속성 인터페이스
interface WeatherCardProps {
  time: string;
  icon: WeatherIcon;
  temperature: string;
}

// 날씨 아이콘 매핑 (타입 안전성 추가)
const iconMap: Record<WeatherIconType, string> = {
  rain: '🌧️',
  cloud: '☁️',
  sun: '☀️',
  snow: '❄️',
};

// API 오류 타입 정의
type ApiError = 
  | 'API_KEY_MISSING' 
  | 'API_KEY_INVALID' 
  | 'NETWORK_ERROR' 
  | 'LOCATION_ERROR' 
  | 'UNKNOWN_ERROR';

// 날씨 API 응답 인터페이스 (더 상세하게 정의)
interface WeatherApiResponse {
  forecast: {
    forecastday: Array<{
      date: string;
      hour: Array<{
        time: string;
        time_epoch: number;
        temp_c: number;
        temp_f: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        wind_kph: number;
        humidity: number;
        precip_mm: number;
        chance_of_rain: number;
      }>;
    }>;
  };
  current: {
    last_updated: string;
    last_updated_epoch: number;
    temp_c: number;
    condition: {
      text: string;
      code: number;
    };
  };
  location: {
    name: string;
    region: string;
    country: string;
    localtime: string;
  };
  error?: {
    code: number;
    message: string;
  };
}

/**
 * 날씨 조건 코드를 아이콘 타입으로 변환하는 함수
 * @param code 날씨 API 조건 코드
 * @returns 아이콘 타입 (WeatherIconType)
 */
const getIconTypeFromConditionCode = (code: number): WeatherIconType => {
  // 날씨 조건 코드: https://www.weatherapi.com/docs/weather_conditions.json
  console.log(code, 'code');
  if (code >= 1000 && code < 1003) {
    return 'sun'; // 맑음 (코드 1000-1002)
  } else if (code >= 1003 && code < 1063) {
    return 'cloud'; // 구름낌 (코드 1003-1062)
  } else if ((code >= 1063 && code < 1200) || (code >= 1240 && code < 1300)) {
    return 'rain'; // 비 (코드 1063-1199, 1240-1299)
  } else if (code >= 1200 && code < 1240) {
    return 'snow'; // 눈 (코드 1200-1239)
  } else {
    return 'cloud'; // 기본값 (다른 모든 코드)
  }
};

/**
 * 날씨 카드 컴포넌트
 * @param props WeatherCardProps 타입의 속성
 * @returns 날씨 카드 JSX 요소
 */
const WeatherCard = ({ time, icon, temperature }: WeatherCardProps): React.ReactElement => {
  return (
    <div className="flex-shrink-0 flex flex-col justify-evenly font-semibold items-center rounded-lg shadow p-2 w-[100px] h-[100px] bg-[#F6F6F6] text-gray-500">
      <div className="text-xs">{time}</div>
      <div className="text-2xl">{iconMap[icon.type]}</div>
      <div className="">{temperature}</div>
    </div>
  );
};

/**
 * 메인 날씨 리스트 컴포넌트
 * @returns 날씨 리스트 JSX 요소
 */
const WeatherList = (): React.ReactElement => {
  // 날씨 데이터 상태
  const [weatherData, setWeatherData] = useState<WeatherCardProps[]>(defaultWeather);
  // 로딩 상태
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // 에러 상태
  const [error, setError] = useState<string | null>(null);
  // 마지막 업데이트 시간
  const [lastUpdated, setLastUpdated] = useState<string>('');
  // API 키 상태 관리
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);
      
  /**
   * API 키의 유효성을 확인하는 함수
   * @param apiKey 확인할 API 키
   * @returns API 키 유효 여부 (boolean)
   */
  const validateApiKey = (apiKey: string | null | undefined): boolean => {
    if (!apiKey) return false;
    if (apiKey === 'YOUR_API_KEY') return false;
    // WeatherAPI.com API 키는 일반적으로 32자리 16진수 문자열
    return /^[a-zA-Z0-9]{30,36}$/.test(apiKey);
  };

  /**
   * 오류 타입에 따른 에러 메시지 반환 함수
   * @param errorType API 오류 타입
   * @returns 사용자에게 표시할 에러 메시지
   */
  const getErrorMessage = (errorType: ApiError): string => {
    switch (errorType) {
      case 'API_KEY_MISSING':
      case 'API_KEY_INVALID':
        return 'API 키가 유효하지 않습니다. 환경 설정을 확인해주세요.';
      case 'NETWORK_ERROR':
        return '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.';
      case 'LOCATION_ERROR':
        return '위치 정보를 찾을 수 없습니다. 위치 설정을 확인해주세요.';
      case 'UNKNOWN_ERROR':
      default:
        return '날씨 정보를 가져오는데 문제가 발생했습니다.';
    }
  };

  /**
   * 날씨 데이터를 가져오는 함수
   */
  const fetchWeatherData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || 'YOUR_API_KEY';
      
      if (!validateApiKey(API_KEY)) {
        setApiKeyValid(false);
        throw new Error(getErrorMessage('API_KEY_INVALID'));
      }
      
      setApiKeyValid(true);
      
      const location = 'Tokyo';
      
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=2&aqi=no&alerts=no`
      ).catch(() => {
        throw new Error(getErrorMessage('NETWORK_ERROR'));
      });
      
      if (!response.ok) {
        const errorStatus = response.status;
        
        if (errorStatus === 401 || errorStatus === 403) {
          setApiKeyValid(false);
          throw new Error(getErrorMessage('API_KEY_INVALID'));
        } else if (errorStatus === 400) {
          throw new Error(getErrorMessage('LOCATION_ERROR'));
        } else {
          throw new Error(getErrorMessage('UNKNOWN_ERROR'));
        }
      }
      
      const data: WeatherApiResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || getErrorMessage('UNKNOWN_ERROR'));
      }
      
      // 현재 시간 기준으로 앞으로 10시간 동안의 시간별 날씨 데이터 추출
      const currentTimeEpoch = Math.floor(Date.now() / 1000);
      
      if (!data.forecast?.forecastday?.[0]?.hour || !Array.isArray(data.forecast.forecastday[0].hour)) {
        throw new Error(getErrorMessage('UNKNOWN_ERROR'));
      }
      
      // 현재 날짜와 다음 날의 시간 데이터를 합침
      const allHours = [
        ...data.forecast.forecastday[0].hour,
        ...(data.forecast.forecastday[1]?.hour || [])
      ];
      
      // 현재 시간 이후의 데이터만 필터링하고 12개만 선택
      const forecastHours = allHours
        .filter(hour => hour.time_epoch > currentTimeEpoch)
        .slice(0, 12);
      
      if (forecastHours.length === 0) {
        throw new Error('현재 시간 이후의 날씨 예보를 찾을 수 없습니다.');
      }
      
      // WeatherCardProps 형식으로 변환
      const formattedData: WeatherCardProps[] = forecastHours.map(hour => {
        if (!hour.time || hour.temp_c === undefined || hour.condition?.code === undefined) {
          return defaultWeather[0];
        }
        console.log(hour, 'hour')
        // 시간 포맷팅 (HH:MM -> HH am/pm)
        const hourDate = new Date(hour.time);
        const formattedHour = hourDate.getHours() % 12 || 12;
        const amPm = hourDate.getHours() >= 12 ? 'pm' : 'am';
        
        const iconType = getIconTypeFromConditionCode(hour.condition.code);
        return {
          time: `${formattedHour} ${amPm}`,
          icon: {
            type: iconType
          },
          temperature: `${Math.round(hour.temp_c)}°`
        };
      });
      
      // 데이터가 부족한 경우 기본 데이터로 채움
      const finalData = formattedData.length < 10 
        ? [...formattedData, ...defaultWeather.slice(formattedData.length)]
        : formattedData;

      const lastUpdatedTime = data.current?.last_updated || new Date().toISOString();
      
      setWeatherData(finalData);
      setLastUpdated(lastUpdatedTime);
      setIsLoading(false);
    } catch (err) {
      console.error('날씨 데이터 가져오기 오류:', err);
      const errorMessage = err instanceof Error ? err.message : getErrorMessage('UNKNOWN_ERROR');
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  /**
   * 컴포넌트 마운트 시 및 30분마다 날씨 데이터 가져오기
   */
  useEffect(() => {
    // 즉시 날씨 데이터 가져오기
    fetchWeatherData();
    
    // 30분마다 자동 업데이트 (1800000ms = 30분)
    const updateInterval = 30 * 60 * 1000; // 30분을 밀리초로 계산
    const interval = setInterval(() => {
      fetchWeatherData();
    }, updateInterval);
    
    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  /**
   * 안전한 날짜 변환 함수
   * @param dateString 날짜 문자열
   * @returns 포맷된 시간 문자열
   */
  const safeFormatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleTimeString('ko-KR');
    } catch (err) {
      console.error('날짜 변환 오류:', err);
      return '알 수 없음';
    }
  };

  return (
    <section className="mb-2 w-full">
      <div className="flex justify-between items-center mb-2">
        <p className="text-2xl font-semibold">현재 날씨</p>
        {lastUpdated && !isLoading && !error && (
          <p className="text-xs text-gray-500">
            최종 업데이트: {safeFormatDate(lastUpdated)}
          </p>
        )}
      </div>
      
      {apiKeyValid === false ? (
        <div className="bg-red-100 p-3 rounded-lg text-red-800 text-center">
          API 키가 유효하지 않습니다. 환경 변수 NEXT_PUBLIC_WEATHER_API_KEY를 확인해주세요.
        </div>
      ) : error ? (
        <div className="bg-red-100 p-3 rounded-lg text-red-800 text-center">
          {error}
        </div>
      ) : isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {defaultWeather.map((weather, idx) => (
            <div key={idx} className="flex-shrink-0 animate-pulse bg-gray-200 w-[100px] h-[100px] rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {weatherData.map((weather, idx) => (
            <WeatherCard key={idx} {...weather} />
          ))}
        </div>
      )}
    </section>
  );
};

export default WeatherList;