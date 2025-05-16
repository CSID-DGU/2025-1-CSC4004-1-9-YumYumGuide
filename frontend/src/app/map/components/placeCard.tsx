// app/components/placeCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import styles from './placeCard.module.css';

interface PlaceCardProps {
  name: string;
  category: string;
  price: number;
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
}

const PlaceCard: React.FC<PlaceCardProps> = ({
  name,
  category,
  price,
  onShowLocation,
  onRoute,
  activeCard,
  setActiveCard,
}) => {
  const getIconPath = (category: string) => {
    switch (category) {
      case '관광':
        return '/icons/tour.svg';
      case '맛집':
        return '/icons/food.svg';
      default:
        return '/icons/default.svg';
    }
  };

  const isRouteActive = activeCard?.name === name && activeCard?.action === 'route';
  const isShowActive = activeCard?.name === name && activeCard?.action === 'show';

  const handleRouteClick = () => {
    onRoute(name);
    setActiveCard({ name, action: 'route' });
  };

  const handleShowClick = () => {
    onShowLocation(name);
    setActiveCard({ name, action: 'show' });
  };

  return (
    <div className={styles.place}>
      <div className={styles.outBox} />
      <div className={styles.div2} title={name}>{name}</div> {/* 관광지 이름 */}
      <Image
        className={styles.vectorIcon}
        width={19.67}
        height={19.67}
        alt={`${category} 아이콘`}
        src={getIconPath(category)}
      />
      <div className={styles.div1}>
        <span>{`${category} | `}</span>
        <span className={styles.span}>₩</span>
        <span>{price.toLocaleString()}</span>
      </div>
      <div
        className={`${styles.box1} ${isRouteActive ? styles.selectedBox : ''}`}
        onClick={handleRouteClick}
      />
      <div className={styles.div3} onClick={handleRouteClick}>
        길 찾기
      </div>
      <div
        className={`${styles.box2} ${isShowActive ? styles.selectedBox : ''}`}
        onClick={handleShowClick}
      />
      <div className={styles.div4} onClick={handleShowClick}>
        위치 표시
      </div>
    </div>
  );
};

export default PlaceCard;