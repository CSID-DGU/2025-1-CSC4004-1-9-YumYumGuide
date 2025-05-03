'use client';

import type { NextPage } from 'next';
import Image from "next/image";
import styles from './signin.module.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const Frame: NextPage = () => {
  const router = useRouter();

  const [nickname, setNickname] = useState('');
  const [isNicknameFocused, setIsNicknameFocused] = useState(false);

  const [smoking, setSmoking] = useState('');
  const [drinking, setDrinking] = useState('');
  const [pet, setPet] = useState('');
  const [likeFood, setLikeFood] = useState('');
  const [hateFood, setHateFood] = useState<string[]>([]);
  const [headcount, setHeadcount] = useState('');
  const [theme, setTheme] = useState('');

  const toggleHateFood = (item: string) => {
    setHateFood(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const getClass = (base: string, isSelected: boolean) =>
    `${styles[base]} ${styles.selectBox} ${isSelected ? styles.selected : ''}`;

  const getLabelClass = (base: string) => `${styles[base]} ${styles.textLabel}`;

  return (
    <div className={styles.div}>
      <div className={styles.div1}>회원 가입</div>
      <Image
        className={styles.backIcon}
        width={44}
        height={44}
        alt="back"
        src="/icons/back.svg"
        onClick={() => router.push('/login')}
        style={{ cursor: 'pointer' }}
      />
      <div className={styles.inner}>
        <div className={styles.nicknameParent}>
          {/* 닉네임 */}
          <div className={styles.nickname}>
            <div className={styles.div3}>닉네임</div>
            <div className={styles.rrr1} />
            <input
              className={styles.name}
              type="text"
              placeholder={!isNicknameFocused && nickname === '' ? '닉네임을 입력해 주세요.' : ''}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onFocus={() => setIsNicknameFocused(true)}
              onBlur={() => setIsNicknameFocused(nickname !== '')}
            />
          </div>

          {/* 흡연 유무 */}
          <div className={styles.smoking}>
            <div className={styles.div3}>흡연 유무</div>
            <div className={styles.r1} />
            <div className={getClass('box2_1', smoking === '흡연함')} onClick={() => setSmoking('흡연함')} />
            <div className={getLabelClass('div4')} onClick={() => setSmoking('흡연함')}>흡연함</div>
            <div className={getClass('box2_2', smoking === '흡연 안 함')} onClick={() => setSmoking('흡연 안 함')} />
            <div className={getLabelClass('div5')} onClick={() => setSmoking('흡연 안 함')}>흡연 안 함</div>
            <div className={styles.rrr11} />
            <div className={styles.result}>{smoking}</div>
          </div>

          {/* 음주 유무 */}
          <div className={styles.smoking}>
            <div className={styles.div3}>음주 유무</div>
            <div className={styles.r1} />
            <div className={getClass('box3_1', drinking === '음주함')} onClick={() => setDrinking('음주함')} />
            <div className={getLabelClass('div4')} onClick={() => setDrinking('음주함')}>음주함</div>
            <div className={getClass('box3_2', drinking === '음주 안 함')} onClick={() => setDrinking('음주 안 함')} />
            <div className={getLabelClass('div5')} onClick={() => setDrinking('음주 안 함')}>음주 안 함</div>
            <div className={styles.rrr11} />
            <div className={styles.result}>{drinking}</div>
          </div>

          {/* 애견 동반 유무 */}
          <div className={styles.smoking}>
            <div className={styles.div3}>애견 동반 유무</div>
            <div className={styles.r1} />
            <div className={getClass('box4_1', pet === '애견 동반함')} onClick={() => setPet('애견 동반함')} />
            <div className={getLabelClass('div4')} onClick={() => setPet('애견 동반함')}>애견 동반함</div>
            <div className={getClass('box4_2', pet === '애견 동반 안 함')} onClick={() => setPet('애견 동반 안 함')} />
            <div className={getLabelClass('div13')} onClick={() => setPet('애견 동반 안 함')}>애견 동반 안 함</div>
            <div className={styles.rrr11} />
            <div className={styles.result}>{pet}</div>
          </div>

          {/* 좋아하는 음식 */}
          <div className={styles.likeFood}>
            <div className={styles.div3}>좋아하는 음식</div>
            <div className={styles.r1} />
            <div className={getClass('box5_1', likeFood === '육류')} onClick={() => setLikeFood('육류')} />
            <div className={getLabelClass('div16')} onClick={() => setLikeFood('육류')}>육류</div>
            <div className={getClass('box5_2', likeFood === '해산물')} onClick={() => setLikeFood('해산물')} />
            <div className={getLabelClass('div17')} onClick={() => setLikeFood('해산물')}>해산물</div>
            <div className={getClass('box5_3', likeFood === '면류')} onClick={() => setLikeFood('면류')} />
            <div className={getLabelClass('div18')} onClick={() => setLikeFood('면류')}>면류</div>
            <div className={getClass('box5_4', likeFood === '밥류')} onClick={() => setLikeFood('밥류')} />
            <div className={getLabelClass('div19')} onClick={() => setLikeFood('밥류')}>밥류</div>
            <div className={styles.rrr11} />
            <div className={styles.result}>{likeFood}</div>
          </div>

          {/* 못 먹는 음식 (다중 선택) */}
          <div className={styles.likeFood}>
            <div className={styles.div21}>못 먹는 음식</div>
            <div className={styles.r1} />
            <div className={getClass('box6_1', hateFood.includes('견과류'))} onClick={() => toggleHateFood('견과류')} />
            <div className={getLabelClass('div16')} onClick={() => toggleHateFood('견과류')}>견과류</div>
            <div className={getClass('box6_2', hateFood.includes('해산물'))} onClick={() => toggleHateFood('해산물')} />
            <div className={getLabelClass('div17')} onClick={() => toggleHateFood('해산물')}>해산물</div>
            <div className={getClass('box6_3', hateFood.includes('유제품'))} onClick={() => toggleHateFood('유제품')} />
            <div className={getLabelClass('div24')} onClick={() => toggleHateFood('유제품')}>유제품</div>
            <div className={getClass('box6_4', hateFood.includes('밀가루'))} onClick={() => toggleHateFood('밀가루')} />
            <div className={getLabelClass('div25')} onClick={() => toggleHateFood('밀가루')}>밀가루</div>
            <div className={styles.rrr11} />
            <div className={styles.result}>
                {['견과류', '해산물', '유제품', '밀가루'].filter(item => hateFood.includes(item)).join(', ')}
            </div>
          </div>

          {/* 여행 인원 */}
          <div className={styles.headcount}>
            <div className={styles.div3}>여행 인원</div>
            <div className={styles.r1} />
            <div className={getClass('box7_1', headcount === '1인/2인')} onClick={() => setHeadcount('1인/2인')} />
            <div className={getLabelClass('div4')} onClick={() => setHeadcount('1인/2인')}>1인/2인</div>
            <div className={getClass('box7_2', headcount === '3인 이상')} onClick={() => setHeadcount('3인 이상')} />
            <div className={getLabelClass('div13')} onClick={() => setHeadcount('3인 이상')}>3인 이상</div>
            <div className={styles.rrr16} />
            <div className={styles.result}>{headcount}</div>
          </div>

          {/* 관광지 유형 */}
          <div className={styles.theme}>
            <div className={styles.div3}>관광지 유형</div>
            <div className={styles.r1} />
            <div className={getClass('box8_1', theme === '자연')} onClick={() => setTheme('자연')} />
            <div className={getLabelClass('div32')} onClick={() => setTheme('자연')}>자연</div>
            <div className={getClass('box8_2', theme === '축제')} onClick={() => setTheme('축제')} />
            <div className={getLabelClass('div33')} onClick={() => setTheme('축제')}>축제</div>
            <div className={getClass('box8_3', theme === '역사')} onClick={() => setTheme('역사')} />
            <div className={getLabelClass('div34')} onClick={() => setTheme('역사')}>역사</div>
            <div className={getClass('box8_4', theme === '액티비티')} onClick={() => setTheme('액티비티')} />
            <div className={getLabelClass('div35')} onClick={() => setTheme('액티비티')}>액티비티</div>
            <div className={getClass('box8_5', theme === '랜드마크')} onClick={() => setTheme('랜드마크')} />
            <div className={getLabelClass('div36')} onClick={() => setTheme('랜드마크')}>랜드마크</div>
            <div className={styles.rrr17} />
            <div className={styles.result}>{theme}</div>
          </div>

          {/* 회원가입 버튼 */}
          <div className={styles.sign}>
            <div className={`${styles.signbutton} ${styles.pointer}`} />
            <div className={styles.div38}>회원 가입하기</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Frame;