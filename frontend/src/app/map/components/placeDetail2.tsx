// placeDetail2.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useQueryDetail } from '@/api/detail';
import styles from './placeDetail2.module.css';

interface PlaceDetail2Props {
  placeId: string;
  onClose: () => void;
}

type DetailData = {
  type: 'restaurant' | 'attraction';
  video?: string;
  restaurant_name?: string;
  attraction?: string;
  rating?: number;
  location?: string;
  address?: string;
  business_hours?: string;
  closed_days?: string;
  budget?: string;
  seats?: number;
  menus?: { _id: string; menu: string; price: number }[];
  smoking?: string;
  parking?: string;
  wifi_available?: string;
  credit_card?: string;
  phone_number?: string;
  genre?: string;
  description?: string;
  remarks?: string;
  price?: string;
  image?: string;
};

const PlaceDetail2: React.FC<PlaceDetail2Props> = ({ placeId, onClose }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { data, isLoading, error } = useQueryDetail(placeId);

  // 백그라운드 클릭 시 모달 닫기
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (isLoading) return <div className={styles.loading}>로딩 중...</div>;
  if (error || !data?.data) {
    return (
      <div className={styles.error}>
        <p>데이터를 불러오지 못했습니다.</p>
        <button onClick={onClose}>닫기</button>
      </div>
    );
  }

  const detail = data.data as DetailData;
  const isRestaurant = detail.type === 'restaurant';

  return (
    <div className={styles.container} onClick={handleBackgroundClick}>
      <div className={styles.content}>
        <button onClick={onClose} className={styles.backButton}>✕</button>

        <div className={styles.imageContainer}>
          <Image
            src={detail.video || detail.image || '/default.png'}
            alt={detail.restaurant_name || detail.attraction || '장소 이미지'}
            fill
            className={styles.image}
          />
        </div>

        <div className={styles.contentInner}>
          <div className={styles.header}>
            <h1 className={styles.title}>{detail.restaurant_name || detail.attraction}</h1>
            {detail.rating && (
              <div className={styles.rating}>
                <span>★</span>
                <span>{detail.rating}</span>
              </div>
            )}
          </div>

          <div className={styles.location}>
            <span>{detail.address || detail.location}</span>
          </div>

          <div className={styles.divider} />

          {isRestaurant ? (
            <>
              <h2 className={styles.sectionTitle}>영업 정보</h2>
              <div className={styles.grid}>
                <div>영업시간: {detail.business_hours}</div>
                <div>휴무일: {detail.closed_days}</div>
                <div>예산: {detail.budget}</div>
                <div>좌석 수: {detail.seats}석</div>
              </div>

              {detail.menus?.length > 0 && (
                <>
                  <div className={styles.divider} />
                  <div className={styles.menuHeader} onClick={() => setShowMenu(!showMenu)}>
                    <h2 className={styles.sectionTitle}>메뉴</h2>
                    <span>{showMenu ? '▼' : '▶'}</span>
                  </div>
                  {showMenu && (
                    <div className={styles.menuList}>
                      {detail.menus.map((menu) => (
                        <div key={menu._id} className={styles.menuItem}>
                          <span>{menu.menu}</span>
                          <span>¥{menu.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div className={styles.divider} />
              <h2 className={styles.sectionTitle}>시설 정보</h2>
              <div className={styles.grid}>
                <div>흡연: {detail.smoking}</div>
                <div>주차: {detail.parking}</div>
                <div>Wi-Fi: {detail.wifi_available}</div>
                <div>결제: {detail.credit_card}</div>
              </div>

              <div className={styles.divider} />
              <h2 className={styles.sectionTitle}>기타 정보</h2>
              <div className={styles.grid}>
                <div>전화번호: {detail.phone_number}</div>
                <div>장르: {detail.genre}</div>
              </div>

              {detail.remarks && (
                <>
                  <div className={styles.divider} />
                  <h2 className={styles.sectionTitle}>특이사항</h2>
                  <p className={styles.description}>{detail.remarks}</p>
                </>
              )}
            </>
          ) : (
            <>
              <h2 className={styles.sectionTitle}>설명</h2>
              <p className={styles.description}>{detail.description}</p>
              {detail.price && (
                <>
                  <div className={styles.divider} />
                  <h2 className={styles.sectionTitle}>가격 정보</h2>
                  <p className={styles.priceInfo}>{detail.price} ￥</p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceDetail2;