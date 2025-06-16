// map.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Nav from '../componets/nav';
import PlaceCard from './components/placeCard';
import DayCard from './components/dayCard';
import GoogleMapComponent from './components/googleMap';
import PlaceDetail1 from './components/placeDetail1';
import PlaceDetail2 from './components/placeDetail2';
import styles from './map.module.css';
import { useQuerySchedule } from '@/api/schedule';

interface MappedPlace {
  name: string;
  refId: string;
  category?: string;
  price: string | number;
  location?: string;
  image?: string;
  address: string;
  description?: string;
  genre?: string; // 추가
}

const Map: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedPlaceName, setSelectedPlaceName] = useState<string | null>(null);
  const [detail2PlaceId, setDetail2PlaceId] = useState<string | null>(null);
  const [routeToPlace, setRouteToPlace] = useState<{ name: string; address: string } | null>(null);
  const [activeCard, setActiveCard] = useState<{ name: string; action: 'route' | 'show' | null } | null>(null);
  const [selectedPathCardName, setSelectedPathCardName] = useState<string | null>(null);
  const [customRoute, setCustomRoute] = useState<{ from: MappedPlace; to: MappedPlace } | null>(null);
  const [startPlace, setStartPlace] = useState<string | null>(null);
  const [endPlace, setEndPlace] = useState<string | null>(null);

  const { data: scheduleAPIResponse, isLoading, isError } = useQuerySchedule();

  const { currentSchedule, transformedPlacesByDay, availableDays }: any = useMemo(() => {
    const schedule = scheduleAPIResponse?.data?.[0];
    if (!schedule || !schedule.days) {
      return { currentSchedule: null, transformedPlacesByDay: {}, availableDays: [] };
    }

    const places: Record<number, MappedPlace[]> = {};
    schedule.days.forEach((dayData) => {
      places[dayData.day] = (dayData.events as any[]).map((event: any) => ({
        name: event.name,
        refId: event.refId,
        category: event.type === 'meal' ? 'restaurant' : event.type,
        price: event.budget ?? 0,
        address: event.address || event.location || '',
        description: event.description || '',
        image: event.image || '',
        genre: event.genre || '', // 추가
      }));
    });

    const daysOrder = schedule.days.map((d) => d.day).sort((a, b) => a - b);
    return { currentSchedule: schedule, transformedPlacesByDay: places, availableDays: daysOrder };
  }, [scheduleAPIResponse]);

  useEffect(() => {
    if (availableDays.length > 0 && !availableDays.includes(selectedDay)) {
      setSelectedDay(availableDays[0]);
    } else if (availableDays.length === 0 && selectedDay !== 1) {
      setSelectedDay(1);
    }
  }, [availableDays, selectedDay]);

  useEffect(() => {
    if (startPlace && endPlace) {
      const from = transformedPlacesByDay[selectedDay].find((p) => p.name === startPlace);
      const to = transformedPlacesByDay[selectedDay].find((p) => p.name === endPlace);
      if (from && to) {
        setCustomRoute({ from, to });
      }
      setSelectedPlaceName(null);
      setRouteToPlace(null);
      setActiveCard(null);
    }
  }, [startPlace, endPlace]);

  const handleShowLocation = (name: string) => {
    setSelectedPlaceName(name);
    setRouteToPlace(null);
    setCustomRoute(null);
    setSelectedPathCardName(null);
  };

  const handleRouteToLocation = (name: string) => {
    const place = transformedPlacesByDay[selectedDay].find((p) => p.name === name);
    if (!place) return;
    setRouteToPlace({ name: place.name, address: place.address });
    setSelectedPlaceName(null);
    setCustomRoute(null);
    setSelectedPathCardName(null);
  };

  const handleOutBoxClick = (name: string) => {
    setActiveCard(null);
    setSelectedPathCardName(name);
    setSelectedPlaceName(name);

    const dayPlaces = transformedPlacesByDay[selectedDay];
    const currentIndex = dayPlaces.findIndex((p: MappedPlace) => p.name === name);

    if (currentIndex === 0 || currentIndex === -1) {
      const place = dayPlaces[currentIndex];
      if (place) setRouteToPlace({ name: place.name, address: place.address });
      setCustomRoute(null);
    } else {
      const from = dayPlaces[currentIndex - 1];
      const to = dayPlaces[currentIndex];
      setCustomRoute({ from, to });
      setRouteToPlace(null);
    }
  };

  const placesForSelectedDay = transformedPlacesByDay[selectedDay] || [];

  const filteredPlacesForMap =
    selectedPathCardName && !customRoute && !routeToPlace && selectedPlaceName
      ? [
          {
            name: selectedPlaceName,
            address: placesForSelectedDay.find((p) => p.name === selectedPlaceName)?.address || '',
          },
        ]
      : placesForSelectedDay.map((place) => ({ name: place.name, address: place.address }));

  const selectedPlace = selectedPlaceName ? placesForSelectedDay.find((p) => p.name === selectedPlaceName) : null;

  // description 로직 수정
  const getDescriptionText = (place: MappedPlace | null) => {
    if (!place) return '';

    if (place.category === 'restaurant') {
      return place.genre || '';
    } else {
      return place.description || '';
    }
  };

  if (isLoading) {
    return (
      <div className={styles.div}>
        <Nav />
        <div className="flex justify-center items-center h-full">로딩 중...</div>
      </div>
    );
  }

  if (isError || !currentSchedule) {
    return (
      <div className={styles.div}>
        <Nav />
        <div className="flex justify-center items-center h-full text-lime-500">일정을 만들고 이용해주세요</div>
      </div>
    );
  }

  return (
    <div className={styles.div}>
      <div className={styles.child}>
        <GoogleMapComponent
          selectedPlaceName={selectedPlaceName}
          routeToPlace={routeToPlace}
          customRoute={customRoute}
          placesForDay={filteredPlacesForMap}
        />
      </div>

      <div
        className={`${styles.scrollWrapper} ${availableDays.length <= 3 ? styles.threeOrLess : styles.moreThanThree}`}
      >
        {availableDays.map((dayNum: number) => (
          <DayCard
            key={dayNum}
            day={dayNum}
            selected={selectedDay === dayNum}
            totalDays={availableDays.length}
            onClick={() => {
              setSelectedDay(dayNum);
              setSelectedPlaceName(null);
              setRouteToPlace(null);
              setActiveCard(null);
              setCustomRoute(null);
              setSelectedPathCardName(null);
              setStartPlace(null);
              setEndPlace(null);
            }}
          />
        ))}
      </div>

      <div className={styles.cardScrollWrapper}>
        {placesForSelectedDay.map((place) => (
          <PlaceCard
            key={place.name}
            name={place.name}
            category={place.category}
            price={place.price}
            onShowLocation={handleShowLocation}
            onRoute={handleRouteToLocation}
            activeCard={activeCard}
            setActiveCard={setActiveCard}
            onOutBoxClick={handleOutBoxClick}
            selectedPathCardName={selectedPathCardName}
            setSelectedPathCardName={setSelectedPathCardName}
            startPlace={startPlace}
            endPlace={endPlace}
            setStartPlace={setStartPlace}
            setEndPlace={setEndPlace}
          />
        ))}

        {placesForSelectedDay.length === 0 && (
          <div className="text-center text-gray-500 py-4">선택된 날짜에 일정이 없습니다.</div>
        )}
      </div>

      <div
        className="px-2 py-141 flex justify-center"
        onClick={() => selectedPlace && setDetail2PlaceId(selectedPlace.refId)}
      >
        <PlaceDetail1
          name={selectedPlace?.name || ''}
          address={selectedPlace?.address || ''}
          description={getDescriptionText(selectedPlace)}
          imageSrc={selectedPlace?.image || '/default-image.jpg'}
          isEmpty={!selectedPlace}
        />
      </div>

      {detail2PlaceId && (
        <div className={styles.detailOverlay}>
          <PlaceDetail2 placeId={detail2PlaceId} onClose={() => setDetail2PlaceId(null)} />
        </div>
      )}

      <Nav />
    </div>
  );
};

export default Map;
