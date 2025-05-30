'use client';

import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from '../preferences.module.css'; // 경로 수정
import Cookies from 'js-cookie';

const DEFAULTS = {
  smoking:  0, // 0: 흡연 안 함, 1: 흡연함
  drinking: 0, // 0: 음주 안 함, 1: 음주함
  travelStyle:    '관광지 위주',
  favoriteFood: '육류',
  groupType: '1인&2인',
  attractionType: [] as string[],
};

type SingleKey = 'smoking' | 'drinking' | 'travelStyle' | 'favoriteFood' | 'groupType';

// 컴포넌트 이름 변경: Preferences -> PreferenceForm
const PreferenceForm: FC = () => {
  const router = useRouter();

  /* — state — */
  const [smoking,   setSmoking]   = useState<number>(DEFAULTS.smoking);
  const [drinking,  setDrinking]  = useState<number>(DEFAULTS.drinking);
  const [travelStyle, setTravelStyle] = useState(DEFAULTS.travelStyle);
  const [favoriteFood, setFavoriteFood] = useState(DEFAULTS.favoriteFood);
  const [groupType, setGroupType] = useState(DEFAULTS.groupType);
  const [attractionType, setAttractionType] = useState<string[]>(DEFAULTS.attractionType);
  const [saved,     setSaved]     = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /* — load saved prefs — */
  useEffect(() => {
    const fetchPreferences = async () => {
      setIsLoading(true);
      const token = Cookies.get('auth_token');
      if (!token) {
        console.error('[PreferenceForm] No auth token, redirecting to login'); // 컴포넌트명 변경
        router.push('/login');
        return;
      }
      console.log('[PreferenceForm] Fetching preferences...'); // 컴포넌트명 변경
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favorite`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        console.log('[PreferenceForm] GET /api/favorite response status:', response.status);
        const responseBody = await response.text();
        console.log('[PreferenceForm] GET /api/favorite response body:', responseBody);

        if (response.ok) {
          const data = JSON.parse(responseBody);
          console.log('[PreferenceForm] Preferences data received:', data);
          if (Object.keys(data).length === 0) {
            console.log('[PreferenceForm] No preferences found on server, using defaults.');
            setSmoking(DEFAULTS.smoking);
            setDrinking(DEFAULTS.drinking);
            setTravelStyle(DEFAULTS.travelStyle);
            setFavoriteFood(DEFAULTS.favoriteFood);
            setGroupType(DEFAULTS.groupType);
            setAttractionType(DEFAULTS.attractionType);
          } else {
            console.log('[PreferenceForm] Applying preferences from server.');
            setSmoking(Number(data.smoking ?? DEFAULTS.smoking));
            setDrinking(Number(data.drinking ?? DEFAULTS.drinking));
            setTravelStyle(data.travelStyle || DEFAULTS.travelStyle);
            setFavoriteFood(data.favoriteFood || DEFAULTS.favoriteFood);
            setGroupType(data.groupType || DEFAULTS.groupType);
            setAttractionType(data.attractionType || DEFAULTS.attractionType);
          }
        } else if (response.status === 401) {
          console.error('[PreferenceForm] Unauthorized, redirecting to login');
          router.push('/login');
        } else {
          console.error('[PreferenceForm] Failed to fetch preferences. Status:', response.status, 'Body:', responseBody);
        }
      } catch (error) {
        console.error('[PreferenceForm] Error fetching preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPreferences();
  }, [router]);

  /* — helpers — */
  const isSel = (cat: keyof typeof DEFAULTS, val: string | number) => {
    if (cat === 'attractionType') return attractionType.includes(val as string);
    if (cat === 'smoking' || cat === 'drinking') {
        const currentValues = { smoking, drinking };
        return currentValues[cat] === val;
    }
    const currentStringValues = { travelStyle, favoriteFood, groupType };
    return currentStringValues[cat as Exclude<SingleKey, 'smoking' | 'drinking'>] === val;
  };

  const toggleAttractionType = (item: string) => {
    setAttractionType(prev => {
      const isAlreadySelected = prev.includes(item);
      if (isAlreadySelected) {
        return prev.filter(i => i !== item);
      } else {
        if (prev.length < 2) {
          return [...prev, item];
        }
        return prev;
      }
    });
  };

  const handleSave = async () => {
    const token = Cookies.get('auth_token');
    if (!token) {
      console.error('[PreferenceForm] No auth token on save, redirecting to login');
      router.push('/login');
      return;
    }

    if (travelStyle === '' || favoriteFood === '' || groupType === '' || attractionType.length === 0) {
        alert('흡연, 음주 외 모든 항목을 선택해주세요 (관광지 유형 최소 1개).');
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
    console.log('[PreferenceForm] Saving preferences:', JSON.stringify(preferencesToSave, null, 2));

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
      console.log('[PreferenceForm] PUT /api/favorite response status:', response.status);
      console.log('[PreferenceForm] PUT /api/favorite response body:', responseBodyText);

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
        console.log('[PreferenceForm] Preferences saved successfully.');
      } else {
        alert(`저장 실패: ${responseBodyText || '서버 오류'}`);
        console.error('[PreferenceForm] Save failed. Status:', response.status, 'Body:', responseBodyText);
      }
    } catch (error) {
      console.error('[PreferenceForm] Error saving preferences:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  /* — UI — */
  if (isLoading) {
    return <div className={styles.div}>Loading...</div>; // 간단한 로딩 표시
  }

  return (
    <div className={styles.div}> {/* 이 div는 page.tsx에 남겨둘 수도 있습니다. */} 
      <div className={styles.div1}>사용자 취향 설정</div>

      {/* 저장 */}
      <Image
        className={`${styles.saveIcon} ${styles.pointer} ${saved ? styles.saveIconActive : ''}`}
        src="/icons/save.svg" width={44} height={44} alt="save" onClick={handleSave}
      />

      {/* 뒤로 */}
      <Image
        className={`${styles.backIcon} ${styles.pointer}`}
        src="/icons/back.svg" width={44} height={44} alt="back" onClick={() => router.back()}
      />

      {/* <Image className={styles.profileIcon} src="/icons/profile_icon.svg" width={49} height={49} alt="profile" /> */}

      {/* 본문 */}
      <div className={styles.inner}>
        <div className={styles.smokingParent}>
          {/* === 1. 흡연 유무 === */}
          <div className={styles.smoking}>
            <div className={styles.div2}>흡연 유무</div><div className={styles.r1} />
            <div className={`${styles.box1_1} ${styles.pointer} ${isSel('smoking', 1) ? styles.selected : ''}`} onClick={() => setSmoking(1)} />
            <div className={`${styles.div3} ${styles.textLabel}`} onClick={() => setSmoking(1)}>흡연함</div>
            <div className={`${styles.box1_2} ${styles.pointer} ${isSel('smoking', 0) ? styles.selected : ''}`} onClick={() => setSmoking(0)} />
            <div className={`${styles.div4} ${styles.textLabel}`} onClick={() => setSmoking(0)}>흡연 안 함</div>
            <div className={styles.rrr1} /><div className={styles.div5}>{smoking === 1 ? '흡연함' : '흡연 안 함'}</div>
          </div>

          {/* === 2. 음주 유무 === */}
          <div className={styles.smoking}> {/* className은 smoking으로 되어있지만 음주 관련 UI임 */}
            <div className={styles.div2}>음주 유무</div><div className={styles.r1}/>
            <div className={`${styles.box2_1} ${styles.pointer} ${isSel('drinking', 1) ? styles.selected : ''}`}
                 onClick={()=>setDrinking(1)}/>
            <div className={`${styles.div3} ${styles.textLabel}`}
                 onClick={()=>setDrinking(1)}>음주함</div>
            <div className={`${styles.box2_2} ${styles.pointer} ${isSel('drinking', 0) ? styles.selected : ''}`}
                 onClick={()=>setDrinking(0)}/>
            <div className={`${styles.div8} ${styles.textLabel}`}
                 onClick={()=>setDrinking(0)}>음주 안 함</div>
            <div className={styles.rrr1}/><div className={styles.div5}>{drinking === 1 ? '음주함' : '음주 안 함'}</div>
          </div>

          {/* === 3. 여행 스타일 === */}
          <div className={styles.smoking}> {/* className은 smoking으로 되어있지만 여행 스타일 관련 UI임 */}
            <div className={styles.div10}>여행 스타일</div><div className={styles.r1}/>
            <div className={`${styles.box3_1} ${styles.pointer} ${isSel('travelStyle', '맛집 위주') ? styles.selected : ''}`}
                 onClick={()=>setTravelStyle('맛집 위주')}/>
            <div className={`${styles.div3} ${styles.textLabel}`}
                 onClick={()=>setTravelStyle('맛집 위주')}>맛집 위주</div>
            <div className={`${styles.box3_2} ${styles.pointer} ${isSel('travelStyle', '관광지 위주') ? styles.selected : ''}`}
                 onClick={()=>setTravelStyle('관광지 위주')}/>
            <div className={`${styles.div12} ${styles.textLabel}`}
                 onClick={()=>setTravelStyle('관광지 위주')}>관광지 위주</div>
            <div className={styles.rrr1}/><div className={styles.div13}>{travelStyle}</div>
          </div>

          {/* === 4. 좋아하는 음식 (단일) === */}
          <div className={styles.likeFood}>
            <div className={styles.div14}>좋아하는 음식</div><div className={styles.r1}/>
            {[
              ['육류',    styles.box4_1, styles.div15],
              ['해산물',  styles.box4_2, styles.div16],
              ['면류',    styles.box4_3, styles.div17],
              ['밥류',    styles.box4_4, styles.div18],
            ].map(([lab, box, txt]) => (
              <div key={lab as string}>
                <div className={`${box as string} ${styles.pointer} ${isSel('favoriteFood', lab as string) ? styles.selected : ''}`}
                     onClick={()=>setFavoriteFood(lab as string)}/>
                <div className={`${txt as string} ${styles.textLabel}`}
                     onClick={()=>setFavoriteFood(lab as string)}>{lab}</div>
              </div>
            ))}
            <div className={styles.rrr1}/><div className={styles.div19}>{favoriteFood}</div>
          </div>

          {/* === 5. 여행 인원 === */}
          <div className={styles.headcount}>
            <div className={styles.div26}>여행 인원</div><div className={styles.r1}/>
            <div className={`${styles.box6_1} ${styles.pointer} ${isSel('groupType', '1인&2인') ? styles.selected : ''}`}
                 onClick={()=>setGroupType('1인&2인')}/>
            <div className={`${styles.div3} ${styles.textLabel}`}
                 onClick={()=>setGroupType('1인&2인')}>1인&2인</div>
            <div className={`${styles.box6_2} ${styles.pointer} ${isSel('groupType', '3인 이상') ? styles.selected : ''}`}
                 onClick={()=>setGroupType('3인 이상')}/>
            <div className={`${styles.div12} ${styles.textLabel}`}
                 onClick={()=>setGroupType('3인 이상')}>3인 이상</div>
            <div className={styles.rrr14}/><div className={styles.div29}>{groupType}</div>
          </div>

          {/* === 6. 관광지 유형 (최대 2개) === */}
          <div className={styles.theme}> {/* className은 theme이지만 관광지 유형 UI */}
            <div className={styles.div30}>관광지 유형 (최대 2개)</div><div className={styles.r1}/>
            {[
              ['자연',      styles.box7_1, styles.div31],
              ['축제',      styles.box7_2, styles.div32],
              ['역사',      styles.box7_3, styles.div33],
              ['액티비티',  styles.box7_4, styles.div34],
              ['랜드마크',  styles.box7_5, styles.div35],
            ].map(([lab, box, txt]) => (
              <div key={lab as string}>
                <div className={`${box as string} ${styles.pointer} ${isSel('attractionType', lab as string) ? styles.selected : ''}`}
                     onClick={()=>toggleAttractionType(lab as string)}/> {/* toggleAttractionType 사용 */}
                <div className={`${txt as string} ${styles.textLabel}`}
                     onClick={()=>toggleAttractionType(lab as string)}>{lab}</div>
              </div>
            ))}
            <div className={styles.rrr15}/><div className={styles.div36}>{attractionType.length ? attractionType.join(', ') : '없음'}</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PreferenceForm; // export 수정 