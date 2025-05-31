'use client';

import { FC, Dispatch, SetStateAction } from 'react';
import styles from '../preferences.module.css';

// 스키마 매핑 함수들
const TRAVEL_STYLE_MAP = {
  0: '맛집 위주',
  1: '관광지 위주'
} as const;

const FAVORITE_FOOD_MAP = {
  0: '육류',
  1: '해산물', 
  2: '면류',
  3: '일본식 술집'
} as const;

const GROUP_TYPE_MAP = {
  0: '1인&2인',
  1: '3인 이상'
} as const;

// 기본값 정의 (number 타입으로 변경)
const DEFAULTS_PREFERENCES_FORM = {
  smoking: null as number | null,
  drinking: null as number | null,
  travelStyle: null as number | null,
  favoriteFood: null as number | null,
  groupType: null as number | null,
  attractionType: [] as string[],
};

type SingleKey = 'smoking' | 'drinking' | 'travelStyle' | 'favoriteFood' | 'groupType';

interface PreferenceItemsFormProps {
  smoking: number | null;
  setSmoking: Dispatch<SetStateAction<number | null>>;
  drinking: number | null;
  setDrinking: Dispatch<SetStateAction<number | null>>;
  travelStyle: number | null;
  setTravelStyle: Dispatch<SetStateAction<number | null>>;
  favoriteFood: number | null;
  setFavoriteFood: Dispatch<SetStateAction<number | null>>;
  groupType: number | null;
  setGroupType: Dispatch<SetStateAction<number | null>>;
  attractionType: string[];
  setAttractionType: Dispatch<SetStateAction<string[]>>;
}

const PreferenceItemsForm: FC<PreferenceItemsFormProps> = ({ 
  smoking, setSmoking,
  drinking, setDrinking,
  travelStyle, setTravelStyle,
  favoriteFood, setFavoriteFood,
  groupType, setGroupType,
  attractionType, setAttractionType
}) => {

  const isSel = (cat: SingleKey | 'attractionType', val: string | number) => {
    if (cat === 'attractionType') return attractionType.includes(val as string);
    
    const currentValues = { smoking, drinking, travelStyle, favoriteFood, groupType };
    if (currentValues[cat] === null) return false; 
    return currentValues[cat] === val;
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
  
  // 결과 표시 텍스트를 위한 헬퍼 함수
  const getDisplayText = (value: number | null, map?: Record<number, string>) => {
    if (value === null) return '미선택';
    if (map && value in map) return map[value];
    return String(value);
  };

  return (
      <div className={styles.smokingParent}>
        {/* === 1. 흡연 유무 === */}
        <div className={styles.smoking}>
          <div className={styles.div2}>흡연 유무</div><div className={styles.r1} />
          <div className={`${styles.box1_1} ${styles.pointer} ${isSel('smoking', 1) ? styles.selected : ''}`} onClick={() => setSmoking(1)} />
          <div className={`${styles.div3} ${styles.textLabel}`} onClick={() => setSmoking(1)}>흡연함</div>
          <div className={`${styles.box1_2} ${styles.pointer} ${isSel('smoking', 0) ? styles.selected : ''}`} onClick={() => setSmoking(0)} />
          <div className={`${styles.div4} ${styles.textLabel}`} onClick={() => setSmoking(0)}>흡연 안 함</div>
          <div className={styles.rrr1} /><div className={styles.div5}>{getDisplayText(smoking, { 0: '흡연 안 함', 1: '흡연함' })}</div>
        </div>

        {/* === 2. 음주 유무 === */}
        <div className={styles.smoking}>
          <div className={styles.div2}>음주 유무</div><div className={styles.r1}/>
          <div className={`${styles.box2_1} ${styles.pointer} ${isSel('drinking', 1) ? styles.selected : ''}`}
                onClick={()=>setDrinking(1)}/>
          <div className={`${styles.div3} ${styles.textLabel}`}
                onClick={()=>setDrinking(1)}>음주함</div>
          <div className={`${styles.box2_2} ${styles.pointer} ${isSel('drinking', 0) ? styles.selected : ''}`}
                onClick={()=>setDrinking(0)}/>
          <div className={`${styles.div8} ${styles.textLabel}`}
                onClick={()=>setDrinking(0)}>음주 안 함</div>
          <div className={styles.rrr1}/><div className={styles.div5}>{getDisplayText(drinking, { 0: '음주 안 함', 1: '음주함' })}</div>
        </div>

        {/* === 3. 여행 스타일 === */}
        <div className={styles.smoking}>
          <div className={styles.div10}>여행 스타일</div><div className={styles.r1}/>
          <div className={`${styles.box3_1} ${styles.pointer} ${isSel('travelStyle', 0) ? styles.selected : ''}`}
                onClick={()=>setTravelStyle(0)}/>
          <div className={`${styles.div3} ${styles.textLabel}`}
                onClick={()=>setTravelStyle(0)}>맛집 위주</div>
          <div className={`${styles.box3_2} ${styles.pointer} ${isSel('travelStyle', 1) ? styles.selected : ''}`}
                onClick={()=>setTravelStyle(1)}/>
          <div className={`${styles.div12} ${styles.textLabel}`}
                onClick={()=>setTravelStyle(1)}>관광지 위주</div>
          <div className={styles.rrr1}/><div className={styles.div13}>{getDisplayText(travelStyle, TRAVEL_STYLE_MAP)}</div>
        </div>

        {/* === 4. 좋아하는 음식 (단일) === */}
        <div className={styles.likeFood}>
          <div className={styles.div14}>좋아하는 음식</div><div className={styles.r1}/>
          {[
            [0, '육류',    styles.box4_1, styles.div15],
            [1, '해산물',  styles.box4_2, styles.div16],
            [2, '면류',    styles.box4_3, styles.div17],
            [3, '일본식 술집', styles.box4_4, styles.div18],
          ].map(([value, label, box, txt]) => (
            <div key={value as number}>
              <div className={`${box as string} ${styles.pointer} ${isSel('favoriteFood', value as number) ? styles.selected : ''}`}
                    onClick={()=>setFavoriteFood(value as number)}/>
              <div className={`${txt as string} ${styles.textLabel}`}
                    onClick={()=>setFavoriteFood(value as number)}>{label}</div>
            </div>
          ))}
          <div className={styles.rrr1}/><div className={styles.div19}>{getDisplayText(favoriteFood, FAVORITE_FOOD_MAP)}</div>
        </div>

        {/* === 5. 여행 인원 === */}
        <div className={styles.headcount}>
          <div className={styles.div26}>여행 인원</div><div className={styles.r1}/>
          <div className={`${styles.box6_1} ${styles.pointer} ${isSel('groupType', 0) ? styles.selected : ''}`}
                onClick={()=>setGroupType(0)}/>
          <div className={`${styles.div3} ${styles.textLabel}`}
                onClick={()=>setGroupType(0)}>1인&2인</div>
          <div className={`${styles.box6_2} ${styles.pointer} ${isSel('groupType', 1) ? styles.selected : ''}`}
                onClick={()=>setGroupType(1)}/>
          <div className={`${styles.div12} ${styles.textLabel}`}
                onClick={()=>setGroupType(1)}>3인 이상</div>
          <div className={styles.rrr14}/><div className={styles.div29}>{getDisplayText(groupType, GROUP_TYPE_MAP)}</div>
        </div>

        {/* === 6. 관광지 유형 (최대 2개) === */}
        <div className={styles.theme}>
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
                    onClick={()=>toggleAttractionType(lab as string)}/>
              <div className={`${txt as string} ${styles.textLabel}`}
                    onClick={()=>toggleAttractionType(lab as string)}>{lab}</div>
            </div>
          ))}
          <div className={styles.rrr15}/><div className={styles.div36}>{attractionType.length ? attractionType.join(', ') : '미선택'}</div>
        </div>

      </div>
  );
};

export default PreferenceItemsForm; 