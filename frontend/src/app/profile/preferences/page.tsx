'use client';

import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './preferences.module.css';
import Cookies from 'js-cookie';

const DEFAULTS = {
  smoking:   '흡연 안 함',
  drinking:  '음주 안 함',
  travelStyle:       '관광지 위주',
  favoriteFood:  '육류',
  hateFood: [] as string[],
  groupType: '1인&2인',
  attractionType: [] as string[],
};

type SingleKey = 'smoking' | 'drinking' | 'travelStyle' | 'favoriteFood' | 'groupType';

const Preferences: FC = () => {
  const router = useRouter();

  /* — state — */
  const [smoking,   setSmoking]   = useState(DEFAULTS.smoking);
  const [drinking,  setDrinking]  = useState(DEFAULTS.drinking);
  const [travelStyle, setTravelStyle] = useState(DEFAULTS.travelStyle);
  const [favoriteFood, setFavoriteFood] = useState(DEFAULTS.favoriteFood);
  const [hateFood, setHateFood] = useState<string[]>(DEFAULTS.hateFood);
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
        console.error('[PreferencesPage] No auth token, redirecting to login');
        router.push('/login');
        return;
      }
      console.log('[PreferencesPage] Fetching preferences...');
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favorite`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        console.log('[PreferencesPage] GET /api/favorite response status:', response.status);
        const responseBody = await response.text();
        console.log('[PreferencesPage] GET /api/favorite response body:', responseBody);

        if (response.ok) {
          const data = JSON.parse(responseBody);
          console.log('[PreferencesPage] Preferences data received:', data);
          if (Object.keys(data).length === 0) {
            console.log('[PreferencesPage] No preferences found on server, using defaults.');
            setSmoking(DEFAULTS.smoking);
            setDrinking(DEFAULTS.drinking);
            setTravelStyle(DEFAULTS.travelStyle);
            setFavoriteFood(DEFAULTS.favoriteFood);
            setHateFood(DEFAULTS.hateFood);
            setGroupType(DEFAULTS.groupType);
            setAttractionType(DEFAULTS.attractionType);
          } else {
            console.log('[PreferencesPage] Applying preferences from server.');
            setSmoking(data.smoking || DEFAULTS.smoking);
            setDrinking(data.drinking || DEFAULTS.drinking);
            setTravelStyle(data.travelStyle || DEFAULTS.travelStyle);
            setFavoriteFood(data.favoriteFood || DEFAULTS.favoriteFood);
            setHateFood(data.hateFood || DEFAULTS.hateFood);
            setGroupType(data.groupType || DEFAULTS.groupType);
            setAttractionType(data.attractionType || DEFAULTS.attractionType);
          }
        } else if (response.status === 401) {
          console.error('[PreferencesPage] Unauthorized, redirecting to login');
          router.push('/login');
        } else {
          console.error('[PreferencesPage] Failed to fetch preferences. Status:', response.status, 'Body:', responseBody);
        }
      } catch (error) {
        console.error('[PreferencesPage] Error fetching preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPreferences();
  }, [router]);

  /* — helpers — */
  const isSel = (cat: keyof typeof DEFAULTS, val: string) => {
    if (cat === 'hateFood') return hateFood.includes(val);
    if (cat === 'attractionType') return attractionType.includes(val);
    const currentValues = { smoking, drinking, travelStyle, favoriteFood, groupType };
    return currentValues[cat as SingleKey] === val;
  };

  const toggleHateFood = (f: string) =>
    setHateFood(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

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
      console.error('[PreferencesPage] No auth token on save, redirecting to login');
      router.push('/login');
      return;
    }

    if (!smoking || !drinking || !travelStyle || !favoriteFood || !groupType || attractionType.length === 0) {
      alert('모든 항목을 선택해주세요 (관광지 유형 최소 1개).');
      return;
    }

    const preferencesToSave = {
      smoking,
      drinking,
      travelStyle,
      favoriteFood,
      hateFood,
      groupType,
      attractionType,
    };
    console.log('[PreferencesPage] Saving preferences:', JSON.stringify(preferencesToSave, null, 2));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favorite`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(preferencesToSave),
      });
      const responseBodyText = await response.text(); // Get text 전쟁
      console.log('[PreferencesPage] PUT /api/favorite response status:', response.status);
      console.log('[PreferencesPage] PUT /api/favorite response body:', responseBodyText);

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
        console.log('[PreferencesPage] Preferences saved successfully.');
      } else {
        alert(`저장 실패: ${responseBodyText || '서버 오류'}`);
        console.error('[PreferencesPage] Save failed. Status:', response.status, 'Body:', responseBodyText);
      }
    } catch (error) {
      console.error('[PreferencesPage] Error saving preferences:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  /* — UI — */
  if (isLoading) {
    return <div className={styles.div}>Loading...</div>; // 간단한 로딩 표시
  }

  return (
    <div className={styles.div}>
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

      <Image className={styles.profileIcon} src="/icons/profile_icon.svg" width={49} height={49} alt="profile" />

      {/* 본문 */}
      <div className={styles.inner}>
        <div className={styles.smokingParent}>
          {/* === 1. 흡연 유무 === */}
          <div className={styles.smoking}>
            <div className={styles.div2}>흡연 유무</div><div className={styles.r1} />
            <div className={`${styles.box1_1} ${styles.pointer} ${isSel('smoking','흡연함') ? styles.selected : ''}`} onClick={() => setSmoking('흡연함')} />
            <div className={`${styles.div3} ${styles.textLabel}`} onClick={() => setSmoking('흡연함')}>흡연함</div>
            <div className={`${styles.box1_2} ${styles.pointer} ${isSel('smoking','흡연 안 함') ? styles.selected : ''}`} onClick={() => setSmoking('흡연 안 함')} />
            <div className={`${styles.div4} ${styles.textLabel}`} onClick={() => setSmoking('흡연 안 함')}>흡연 안 함</div>
            <div className={styles.rrr1} /><div className={styles.div5}>{smoking}</div>
          </div>

          {/* === 2. 음주 유무 === */}
          <div className={styles.smoking}> {/* className은 smoking으로 되어있지만 음주 관련 UI임 */}
            <div className={styles.div2}>음주 유무</div><div className={styles.r1}/>
            <div className={`${styles.box2_1} ${styles.pointer} ${isSel('drinking','음주함') ? styles.selected : ''}`}
                 onClick={()=>setDrinking('음주함')}/>
            <div className={`${styles.div3} ${styles.textLabel}`}
                 onClick={()=>setDrinking('음주함')}>음주함</div>
            <div className={`${styles.box2_2} ${styles.pointer} ${isSel('drinking','음주 안 함') ? styles.selected : ''}`}
                 onClick={()=>setDrinking('음주 안 함')}/>
            <div className={`${styles.div8} ${styles.textLabel}`}
                 onClick={()=>setDrinking('음주 안 함')}>음주 안 함</div>
            <div className={styles.rrr1}/><div className={styles.div5}>{drinking}</div>
          </div>

          {/* === 3. 여행 스타일 === */}
          <div className={styles.smoking}> {/* className은 smoking으로 되어있지만 여행 스타일 관련 UI임 */}
            <div className={styles.div10}>여행 스타일</div><div className={styles.r1}/>
            <div className={`${styles.box3_1} ${styles.pointer} ${isSel('travelStyle','맛집 위주') ? styles.selected : ''}`}
                 onClick={()=>setTravelStyle('맛집 위주')}/>
            <div className={`${styles.div3} ${styles.textLabel}`}
                 onClick={()=>setTravelStyle('맛집 위주')}>맛집 위주</div>
            <div className={`${styles.box3_2} ${styles.pointer} ${isSel('travelStyle','관광지 위주') ? styles.selected : ''}`}
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

          {/* === 5. 못 먹는 음식 (다중) === */}
          <div className={styles.likeFood}> {/* className은 likeFood이지만 못 먹는 음식 UI */} 
            <div className={styles.div20}>못 먹는 음식</div><div className={styles.r1}/>
            {[
              ['견과류', styles.box5_1, styles.div15],
              ['해산물', styles.box5_2, styles.div16],
              ['유제품', styles.box5_3, styles.div23],
              ['밀가루', styles.box5_4, styles.div24],
            ].map(([lab, box, txt]) => (
              <div key={lab as string}>
                <div className={`${box as string} ${styles.pointer} ${isSel('hateFood', lab as string) ? styles.selected : ''}`}
                     onClick={()=>toggleHateFood(lab as string)}/> {/* toggleHateFood 사용 */}
                <div className={`${txt as string} ${styles.textLabel}`}
                     onClick={()=>toggleHateFood(lab as string)}>{lab}</div>
              </div>
            ))}
            <div className={styles.rrr1}/><div className={styles.div25}>{hateFood.length ? hateFood.join(', ') : '없음'}</div>
          </div>

          {/* === 6. 여행 인원 === */}
          <div className={styles.headcount}>
            <div className={styles.div26}>여행 인원</div><div className={styles.r1}/>
            <div className={`${styles.box6_1} ${styles.pointer} ${isSel('groupType','1인&2인') ? styles.selected : ''}`}
                 onClick={()=>setGroupType('1인&2인')}/>
            <div className={`${styles.div3} ${styles.textLabel}`}
                 onClick={()=>setGroupType('1인&2인')}>1인&2인</div>
            <div className={`${styles.box6_2} ${styles.pointer} ${isSel('groupType','3인 이상') ? styles.selected : ''}`}
                 onClick={()=>setGroupType('3인 이상')}/>
            <div className={`${styles.div12} ${styles.textLabel}`}
                 onClick={()=>setGroupType('3인 이상')}>3인 이상</div>
            <div className={styles.rrr14}/><div className={styles.div29}>{groupType}</div>
          </div>

          {/* === 7. 관광지 유형 (최대 2개) === */}
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

export default Preferences;