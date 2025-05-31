'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Cookies from 'js-cookie';
import PreferenceItemsForm from './components/PreferenceItemsForm';
import styles from './preferences.module.css';

const PreferencesPage = () => {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const [smoking, setSmoking] = useState<number | null>(null);
  const [drinking, setDrinking] = useState<number | null>(null);
  const [travelStyle, setTravelStyle] = useState<number | null>(null);
  const [favoriteFood, setFavoriteFood] = useState<number | null>(null);
  const [groupType, setGroupType] = useState<number | null>(null);
  const [attractionType, setAttractionType] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const DEFAULTS_FOR_PAGE = {
    smoking: 0,
    drinking: 0,
    travelStyle: 1,
    favoriteFood: 0,
    groupType: 0,
    attractionType: [] as string[],
  };

  useEffect(() => {
    const fetchPreferences = async () => {
      setIsLoading(true);
      const token = Cookies.get('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favorite`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const responseBody = await response.text();
        if (response.ok) {
          const data = JSON.parse(responseBody);
          if (Object.keys(data).length === 0) {
            setSmoking(DEFAULTS_FOR_PAGE.smoking);
            setDrinking(DEFAULTS_FOR_PAGE.drinking);
            setTravelStyle(DEFAULTS_FOR_PAGE.travelStyle);
            setFavoriteFood(DEFAULTS_FOR_PAGE.favoriteFood);
            setGroupType(DEFAULTS_FOR_PAGE.groupType);
            setAttractionType(DEFAULTS_FOR_PAGE.attractionType);
          } else {
            setSmoking(data.smoking ?? DEFAULTS_FOR_PAGE.smoking);
            setDrinking(data.drinking ?? DEFAULTS_FOR_PAGE.drinking);
            setTravelStyle(data.travelStyle ?? DEFAULTS_FOR_PAGE.travelStyle);
            setFavoriteFood(data.favoriteFood ?? DEFAULTS_FOR_PAGE.favoriteFood);
            setGroupType(data.groupType ?? DEFAULTS_FOR_PAGE.groupType);
            setAttractionType(data.attractionType || DEFAULTS_FOR_PAGE.attractionType);
          }
        } else if (response.status === 401) {
          router.push('/login');
        } else {
          console.error('Failed to fetch preferences. Status:', response.status, 'Body:', responseBody);
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPreferences();
  }, [router]);

  const handleSave = async () => {
    const token = Cookies.get('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }
    if (smoking === null || drinking === null || travelStyle === null || favoriteFood === null || groupType === null || attractionType.length === 0) {
        alert('모든 항목을 선택해주세요 (관광지 유형 최소 1개).');
        return;
    }
    const preferencesToSave = {
      smoking,
      drinking,
      travelStyle,
      favoriteFood,
      groupType,
      attractionType,
    };
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favorite`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(preferencesToSave),
      });
      const responseBodyText = await response.text();
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      } else {
        alert(`저장 실패: ${responseBodyText || '서버 오류'}`);
      }
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return <div className={styles.div}>Loading...</div>; 
  }

  return (
    <div className={styles.div}>
      <div className={styles.div1}>사용자 취향 설정</div>
      <Image
        className={`${styles.saveIcon} ${styles.pointer} ${saved ? styles.saveIconActive : ''}`}
        src="/icons/save.svg" width={44} height={44} alt="save" onClick={handleSave}
      />
      <Image
        className={`${styles.backIcon} ${styles.pointer}`}
        src="/icons/back.svg" width={44} height={44} alt="back" onClick={() => router.back()}
      />

      <div className={styles.inner}>
      <PreferenceItemsForm 
        smoking={smoking}
        setSmoking={setSmoking}
        drinking={drinking}
        setDrinking={setDrinking}
        travelStyle={travelStyle}
        setTravelStyle={setTravelStyle}
        favoriteFood={favoriteFood}
        setFavoriteFood={setFavoriteFood}
        groupType={groupType}
        setGroupType={setGroupType}
        attractionType={attractionType}
        setAttractionType={setAttractionType}
      />
      </div>
    </div>
  );
};

export default PreferencesPage;