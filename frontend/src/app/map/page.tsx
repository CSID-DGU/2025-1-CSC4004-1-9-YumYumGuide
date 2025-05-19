// app/map.tsx
'use client';

import { useState } from 'react';
import Nav from '../componets/nav';
import PlaceCard from './components/placeCard';
import DayCard from './components/dayCard';
import GoogleMapComponent from './components/googleMap';
import styles from './map.module.css';

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
        />
      </div>

      <div className={styles.scrollWrapper}>
        {[1, 2, 3, 4, 5, 6].map((day) => (
          <DayCard
            key={day}
            day={day}
            selected={selectedDay === day}
            onClick={() => setSelectedDay(day)}
          />
        ))}
      </div>

      <div className={styles.cardScrollWrapper}>
        {[
          { name: '남산타워', category: '관광', price: 12000 },
          { name: '63빌딩', category: '관광', price: 22000 },
          { name: '한국의집', category: '맛집', price: 32000 },
          { name: '롯데월드', category: '관광', price: 40000 },
        ].map((place) => (
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