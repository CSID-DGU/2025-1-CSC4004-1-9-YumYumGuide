// placeDetail1.tsx 사진 수정
'use client';

import type { FC } from 'react';
import Image from "next/image";
import { useState, useEffect } from 'react';
import styles from './placeDetail1.module.css';

interface PlaceCardProps {
  name: string;
  address: string;
  description: string;
  imageSrc: string;
  isEmpty?: boolean;
}

const PlaceDetail1: FC<PlaceCardProps> = ({
  name,
  address,
  description,
  imageSrc,
  isEmpty = false
}) => {
  const [imageError, setImageError] = useState(false);

  // imageSrc가 변경될 때마다 imageError 상태를 초기화
  useEffect(() => {
    setImageError(false);
  }, [imageSrc]);

  if (isEmpty) {
    return (
      <div className={styles.emptyPlace}>
        <div className={styles.emptyBox} />
        <div className={styles.emptyText}>장소가 선택되지 않았습니다.</div>
      </div>
    );
  }

  return (
    <div className={styles.place}>
      <div className={styles.placebox} />
      <div className={styles.picture}>
        <Image 
          src={imageError ? '/default_image.png' : imageSrc} 
          alt={name} 
          width={61} 
          height={58} 
          className={styles.pictureImage}
          onError={() => setImageError(true)}
        />
      </div>
      <div className={styles.div}>{name}</div>
      <div className={styles.div1}>{address}</div>
      <Image
        className={styles.arrowIcon}
        width={16}
        height={16}
        sizes="100vw"
        alt="arrow"
        src="/icons/arrow.svg"
      />
    </div>
  );
};

export default PlaceDetail1;