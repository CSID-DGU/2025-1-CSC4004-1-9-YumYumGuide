// PlaceCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import styles from './placeCard.module.css';

interface PlaceCardProps {
  name: string;
  category: string;
  price: number | string;
  onShowLocation: (name: string) => void;
  onRoute: (name: string) => void;
  activeCard: {
    name: string;
    action: 'route' | 'show' | null;
  } | null;
  setActiveCard: React.Dispatch<
    React.SetStateAction<{
      name: string;
      action: 'route' | 'show' | null;
    } | null>
  >;
  onOutBoxClick: (name: string) => void;
  selectedPathCardName: string | null;
  setSelectedPathCardName: React.Dispatch<React.SetStateAction<string | null>>;
  startPlace: string | null;
  endPlace: string | null;
  setStartPlace: React.Dispatch<React.SetStateAction<string | null>>;
  setEndPlace: React.Dispatch<React.SetStateAction<string | null>>;
}

const PlaceCard: React.FC<PlaceCardProps> = ({
  name,
  category,
  price,
  onShowLocation,
  onRoute,
  activeCard,
  setActiveCard,
  onOutBoxClick,
  selectedPathCardName,
  setSelectedPathCardName,
  startPlace,
  endPlace,
  setStartPlace,
  setEndPlace,
}) => {
  const getIconPath = (category: string) => {
    switch (category) {
      case 'attraction':
        return '/icons/tour.svg';
      case 'meal':
      case 'restaurant':
        return '/icons/food.svg';
      default:
        return '/icons/default.svg';
    }
  };

  const isStart = startPlace === name;
  const isEnd = endPlace === name;
  const isRouteActive =
    activeCard?.name === name &&
    activeCard?.action === 'route' &&
    !(startPlace && endPlace);

  const clearStartEnd = () => {
    if (startPlace || endPlace) {
      setStartPlace(null);
      setEndPlace(null);
    }
  };

  const handleRouteClick = () => {
    clearStartEnd();
    onRoute(name);
    setActiveCard({ name, action: 'route' });
  };

  const handleShowClick = () => {
    clearStartEnd();
    onShowLocation(name);
    setActiveCard({ name, action: 'show' });
    setSelectedPathCardName(name);
  };

  const handleStartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (endPlace === name) setEndPlace(null);
    setStartPlace(name);
  };

  const handleEndClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (startPlace === name) setStartPlace(null);
    setEndPlace(name);
  };

  return (
    <div className={styles.place} onClick={handleShowClick}>
      <div
        className={`${styles.outBox} ${
          selectedPathCardName === name ? styles.selectedBox2 : ''
        }`}
      />
      <div className={styles.div2} title={name}>{name}</div>
      <Image
        className={styles.vectorIcon}
        width={19.67}
        height={19.67}
        alt={`${category} 아이콘`}
        src={getIconPath(category)}
      />
      <div className={styles.div1}>
        <span>{`${category === 'attraction' ? '관광' : '맛집'} | `}</span>
        <span className={styles.span}>₩</span>
        <span>{typeof price === 'number' ? price.toLocaleString() : price}</span>
      </div>

      <div
        className={`${styles.box1} ${isRouteActive ? styles.selectedBox : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          handleRouteClick();
        }}
      />
      <div
        className={styles.div3}
        onClick={(e) => {
          e.stopPropagation();
          handleRouteClick();
        }}
      >
        길 찾기
      </div>

      <div
        className={`${styles.boxStart} ${isStart ? styles.startSelected : ''}`}
        onClick={handleStartClick}
      />
      <div className={styles.divStart} onClick={handleStartClick}>출발지</div>

      <div
        className={`${styles.boxEnd} ${isEnd ? styles.endSelected : ''}`}
        onClick={handleEndClick}
      />
      <div className={styles.divEnd} onClick={handleEndClick}>도착지</div>
    </div>
  );
};

export default PlaceCard;