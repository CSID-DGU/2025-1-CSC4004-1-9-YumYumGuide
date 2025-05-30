// map.tsx
'use client';

import { useState } from 'react';
import Nav from '../componets/nav';
import PlaceCard from './components/placeCard';
import DayCard from './components/dayCard';
import GoogleMapComponent from './components/googleMap';
import styles from './map.module.css';

const placesByDay: Record<number, { name: string; category: string; price: number }[]> = {
  1: [
    { name: '남산타워', category: '관광', price: 12000 },
    { name: '63빌딩', category: '관광', price: 22000 },
    { name: '덕수궁', category: '관광', price: 15000 },
  ],
  2: [
    { name: '한국의집', category: '맛집', price: 32000 },
    { name: '남산골 한옥마을', category: '관광', price: 10000 },
  ],
  3: [
    { name: '경복궁', category: '관광', price: 12000 },
    { name: '필동면옥', category: '맛집', price: 20000 },
  ],
  4: [],
  5: [],
  6: [],
};

const Map: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedPlaceName, setSelectedPlaceName] = useState<string | null>(null);
  const [routeToPlaceName, setRouteToPlaceName] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<{
    name: string;
    action: 'route' | 'show' | null;
  } | null>(null);

  const handleShowLocation = (name: string) => {
    setSelectedPlaceName(name);
    setRouteToPlaceName(null);
  };

  const handleRouteToLocation = (name: string) => {
    setRouteToPlaceName(name);
    setSelectedPlaceName(null);
  };

  return (
    <div className={styles.div}>
      <div className={styles.child}>
        <GoogleMapComponent
          selectedPlaceName={selectedPlaceName}
          routeToPlaceName={routeToPlaceName}
          placesForDay={
            selectedPlaceName || routeToPlaceName
              ? undefined
              : placesByDay[selectedDay]?.map((place) => place.name)
          }
        />
      </div>

      <div className={styles.scrollWrapper}>
        {[1, 2, 3, 4, 5, 6].map((day) => (
          <DayCard
            key={day}
            day={day}
            selected={selectedDay === day}
            onClick={() => {
              setSelectedDay(day);
              setSelectedPlaceName(null);
              setRouteToPlaceName(null);
              setActiveCard(null);
            }}
          />
        ))}
      </div>

      <div className={styles.cardScrollWrapper}>
        {placesByDay[selectedDay]?.map((place) => (
          <PlaceCard
            key={place.name}
            name={place.name}
            category={place.category}
            price={place.price}
            onShowLocation={handleShowLocation}
            onRoute={handleRouteToLocation}
            activeCard={activeCard}
            setActiveCard={setActiveCard}
          />
        ))}
      </div>

      <Nav />
    </div>
  );
};

export default Map;