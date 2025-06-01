'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Nav from '../componets/nav'; // 경로 확인 필요
import PlaceCard from './components/placeCard';
import DayCard from './components/dayCard';
import GoogleMapComponent from './components/googleMap';
import styles from './map.module.css';
import { useQuerySchedule } from '@/api/schedule'; // API 훅 경로

interface MappedPlace {
  name: string;
  category: string;
  price: string | number; // 백엔드 Event에 price가 없으므로 'N/A' 또는 기본값 처리
  location?: string;
  image?: string;
}

interface MapPageProps {
  // PlanList와 유사하게 dateRange를 받아 특정 기간의 일정을 필터링하거나,
  // 또는 scheduleId를 받아 특정 일정만 표시할 수 있습니다.
  // 여기서는 dateRange를 사용한다고 가정합니다. (선택 사항)
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
}

const Map: React.FC<MapPageProps> = () => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedPlaceName, setSelectedPlaceName] = useState<string | null>(null);
  const [routeToPlaceName, setRouteToPlaceName] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<{
    name: string;
    action: 'route' | 'show' | null;
  } | null>(null);

  // 백엔드에서 일정 데이터 가져오기
  const { data: scheduleAPIResponse, isLoading, isError } = useQuerySchedule();

  // 가져온 데이터를 컴포넌트가 사용하기 편한 형태로 가공
  const { currentSchedule, transformedPlacesByDay, availableDays }: any = useMemo(() => {
    // API 응답에서 첫 번째 일정을 사용 (또는 특정 로직으로 선택)
    const schedule = scheduleAPIResponse?.data?.[0];

    if (!schedule || !schedule.days) {
      return { currentSchedule: null, transformedPlacesByDay: {}, availableDays: [] };
    }

    const places: Record<number, MappedPlace[]> = {};
    schedule.days.forEach((dayData) => {
      places[dayData.day] = dayData.events.map((event) => ({
        name: event.name,
        category: event.type,
        price: event.budget,
        // location: event.location,
        // image: event.image,
      }));
    });

    const daysOrder = schedule.days.map((d) => d.day).sort((a, b) => a - b);
    return { currentSchedule: schedule, transformedPlacesByDay: places, availableDays: daysOrder };
  }, [scheduleAPIResponse]);

  // 선택된 날짜(selectedDay)가 유효하지 않을 경우 첫 번째 유효한 날짜로 변경
  useEffect(() => {
    if (availableDays.length > 0 && !availableDays.includes(selectedDay)) {
      setSelectedDay(availableDays[0]);
    } else if (availableDays.length === 0 && selectedDay !== 1) {
      // 표시할 날짜가 없으면 기본값 1로 (또는 다른 로직으로 빈 상태 처리)
      setSelectedDay(1);
    }
  }, [availableDays, selectedDay]);

  const handleShowLocation = (name: string) => {
    setSelectedPlaceName(name);
    setRouteToPlaceName(null);
  };

  const handleRouteToLocation = (name: string) => {
    setRouteToPlaceName(name);
    setSelectedPlaceName(null);
  };

  if (isLoading) {
    return (
      <div className={styles.div}>
        <Nav />
        <div className="flex justify-center items-center h-full">로딩 중...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.div}>
        <Nav />
        <div className="flex justify-center items-center h-full text-red-500">
          일정 데이터를 불러오는데 실패했습니다.
        </div>
      </div>
    );
  }

  if (!currentSchedule && !isLoading) {
    return (
      <div className={styles.div}>
        <Nav />
        <div className="flex justify-center items-center h-full">표시할 일정이 없습니다.</div>
      </div>
    );
  }

  const placesForSelectedDay = transformedPlacesByDay[selectedDay] || [];
  console.log('placesForSelectedDay', scheduleAPIResponse);
  return (
    <div className={styles.div}>
      <div className={styles.child}>
        <GoogleMapComponent
          selectedPlaceName={selectedPlaceName}
          routeToPlaceName={routeToPlaceName}
          placesForDay={
            // 현재 선택된 날짜의 장소 이름 목록을 전달 (마커 표시용)
            selectedPlaceName || routeToPlaceName
              ? undefined // 특정 장소가 선택/경로 지정된 경우, 전체 마커 숨김 (선택적)
              : placesForSelectedDay.map((place: any) => place.name)
          }
          // GoogleMapComponent가 MappedPlace 전체 객체를 받아 마커에 더 많은 정보 표시 가능
          // places={placesForSelectedDay}
        />
      </div>

      {/* DayCard: 실제 존재하는 날짜만 표시 */}
      <div className={styles.scrollWrapper}>
        {availableDays.length > 0
          ? availableDays.map((dayNum: any) => (
              <DayCard
                key={dayNum}
                day={dayNum}
                selected={selectedDay === dayNum}
                onClick={() => {
                  setSelectedDay(dayNum);
                  setSelectedPlaceName(null);
                  setRouteToPlaceName(null);
                  setActiveCard(null);
                }}
              />
            ))
          : // Fallback: 표시할 날짜가 없을 때 (예: 일정이 아예 없을 때)
            // Day 1~3 정도를 기본으로 보여주거나, 메시지를 표시할 수 있습니다.
            // 여기서는 DayCard를 표시하지 않도록 처리 (위의 !currentSchedule 에서 이미 처리됨)
            null}
      </div>

      {/* PlaceCard: 선택된 날짜의 장소들 표시 */}
      <div className={styles.cardScrollWrapper}>
        {placesForSelectedDay.map((place) => (
          <PlaceCard
            key={place.name} // 같은 날 같은 이름의 장소가 없다면 사용 가능, 아니면 refId 등 고유값 필요
            name={place.name}
            category={place.category}
            price={place.price} // PlaceCard가 string | number 타입을 받을 수 있도록 수정 필요
            // PlaceCard에 location, image props 추가하여 전달 가능
            // location={place.location}
            // image={place.image}
            onShowLocation={handleShowLocation}
            onRoute={handleRouteToLocation}
            activeCard={activeCard}
            setActiveCard={setActiveCard}
          />
        ))}
        {placesForSelectedDay.length === 0 && availableDays.includes(selectedDay) && (
          <div className="text-center text-gray-500 py-4">선택된 날짜에 일정이 없습니다.</div>
        )}
      </div>

      <Nav />
    </div>
  );
};

export default Map;
