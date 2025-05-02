'use client';

import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './preferences.module.css';

const DEFAULTS = {
  smoking:   '흡연 안 함',
  drinking:  '음주 안 함',
  pet:       '애견 동반 안 함',
  likeFood:  '육류',
  avoidFood: [] as string[],
  headcount: '1인/2인',
  theme:     '자연',
};

type SingleKey = Exclude<keyof typeof DEFAULTS, 'avoidFood'>;

const Preferences = () => {
  const router = useRouter();

  /* — state — */
  const [smoking,   setSmoking]   = useState(DEFAULTS.smoking);
  const [drinking,  setDrinking]  = useState(DEFAULTS.drinking);
  const [pet,       setPet]       = useState(DEFAULTS.pet);
  const [likeFood,  setLikeFood]  = useState(DEFAULTS.likeFood);
  const [avoidFood, setAvoidFood] = useState<string[]>(DEFAULTS.avoidFood);
  const [headcount, setHeadcount] = useState(DEFAULTS.headcount);
  const [theme,     setTheme]     = useState(DEFAULTS.theme);
  const [saved,     setSaved]     = useState(false);

  /* — load saved prefs — */
  useEffect(() => {
    const raw = localStorage.getItem('userPreferences');
    if (!raw) return;
    try {
      const p = JSON.parse(raw);
      setSmoking(p.smoking     ?? DEFAULTS.smoking);
      setDrinking(p.drinking   ?? DEFAULTS.drinking);
      setPet(p.pet             ?? DEFAULTS.pet);
      setLikeFood(p.likeFood   ?? DEFAULTS.likeFood);
      setAvoidFood(p.avoidFood ?? DEFAULTS.avoidFood);
      setHeadcount(p.headcount ?? DEFAULTS.headcount);
      setTheme(p.theme         ?? DEFAULTS.theme);
    } catch {/* ignore */}
  }, []);

  /* — helpers — */
  const isSel = (cat: keyof typeof DEFAULTS, val: string) => {
    if (cat === 'avoidFood') return avoidFood.includes(val);
    const single: Record<SingleKey, string> = { smoking, drinking, pet, likeFood, headcount, theme } as const;
    return single[cat as SingleKey] === val;
  };

  const toggleAvoid = (f: string) =>
    setAvoidFood(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const handleSave = () => {
    localStorage.setItem('userPreferences', JSON.stringify({ smoking, drinking, pet, likeFood, avoidFood, headcount, theme }));
    setSaved(true);
    setTimeout(() => setSaved(false), 1000);
  };

  /* — UI — */
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
          <div className={styles.smoking}>
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

          {/* === 3. 애견 동반 유무 === */}
          <div className={styles.smoking}>
            <div className={styles.div10}>애견 동반 유무</div><div className={styles.r1}/>
            <div className={`${styles.box3_1} ${styles.pointer} ${isSel('pet','애견 동반함') ? styles.selected : ''}`}
                 onClick={()=>setPet('애견 동반함')}/>
            <div className={`${styles.div3} ${styles.textLabel}`}
                 onClick={()=>setPet('애견 동반함')}>애견 동반함</div>

            <div className={`${styles.box3_2} ${styles.pointer} ${isSel('pet','애견 동반 안 함') ? styles.selected : ''}`}
                 onClick={()=>setPet('애견 동반 안 함')}/>
            <div className={`${styles.div12} ${styles.textLabel}`}
                 onClick={()=>setPet('애견 동반 안 함')}>애견 동반 안 함</div>

            <div className={styles.rrr1}/><div className={styles.div13}>{pet}</div>
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
                <div className={`${box as string} ${styles.pointer} ${isSel('likeFood', lab as string) ? styles.selected : ''}`}
                     onClick={()=>setLikeFood(lab as string)}/>
                <div className={`${txt as string} ${styles.textLabel}`}
                     onClick={()=>setLikeFood(lab as string)}>{lab}</div>
              </div>
            ))}
            <div className={styles.rrr1}/><div className={styles.div19}>{likeFood}</div>
          </div>

          {/* === 5. 못 먹는 음식 (다중) === */}
          <div className={styles.likeFood}>
            <div className={styles.div20}>못 먹는 음식</div><div className={styles.r1}/>
            {[
              ['견과류', styles.box5_1, styles.div15],
              ['해산물', styles.box5_2, styles.div16],
              ['유제품', styles.box5_3, styles.div23],
              ['밀가루', styles.box5_4, styles.div24],
            ].map(([lab, box, txt]) => (
              <div key={lab as string}>
                <div className={`${box as string} ${styles.pointer} ${isSel('avoidFood', lab as string) ? styles.selected : ''}`}
                     onClick={()=>toggleAvoid(lab as string)}/>
                <div className={`${txt as string} ${styles.textLabel}`}
                     onClick={()=>toggleAvoid(lab as string)}>{lab}</div>
              </div>
            ))}
            <div className={styles.rrr1}/><div className={styles.div25}>{avoidFood.length ? avoidFood.join(', ') : '없음'}</div>
          </div>

          {/* === 6. 여행 인원 === */}
          <div className={styles.headcount}>
            <div className={styles.div26}>여행 인원</div><div className={styles.r1}/>
            <div className={`${styles.box6_1} ${styles.pointer} ${isSel('headcount','1인/2인') ? styles.selected : ''}`}
                 onClick={()=>setHeadcount('1인/2인')}/>
            <div className={`${styles.div3} ${styles.textLabel}`}
                 onClick={()=>setHeadcount('1인/2인')}>1인/2인</div>

            <div className={`${styles.box6_2} ${styles.pointer} ${isSel('headcount','3인 이상') ? styles.selected : ''}`}
                 onClick={()=>setHeadcount('3인 이상')}/>
            <div className={`${styles.div12} ${styles.textLabel}`}
                 onClick={()=>setHeadcount('3인 이상')}>3인 이상</div>

            <div className={styles.rrr14}/><div className={styles.div29}>{headcount}</div>
          </div>

          {/* === 7. 관광지 유형 === */}
          <div className={styles.theme}>
            <div className={styles.div30}>관광지 유형</div><div className={styles.r1}/>
            {[
              ['자연',      styles.box7_1, styles.div31],
              ['축제',      styles.box7_2, styles.div32],
              ['역사',      styles.box7_3, styles.div33],
              ['액티비티',  styles.box7_4, styles.div34],
              ['랜드마크',  styles.box7_5, styles.div35],
            ].map(([lab, box, txt]) => (
              <div key={lab as string}>
                <div className={`${box as string} ${styles.pointer} ${isSel('theme', lab as string) ? styles.selected : ''}`}
                     onClick={()=>setTheme(lab as string)}/>
                <div className={`${txt as string} ${styles.textLabel}`}
                     onClick={()=>setTheme(lab as string)}>{lab}</div>
              </div>
            ))}
            <div className={styles.rrr15}/><div className={styles.div36}>{theme}</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Preferences;