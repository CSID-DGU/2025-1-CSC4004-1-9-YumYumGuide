'use client';

import { FC, useState } from 'react'; // useEffect는 여기서는 불필요할 수 있습니다.
import { useRouter } from 'next/navigation';
import Image from "next/image";
import styles from '../signin.module.css'; // 경로 수정
import Cookies from 'js-cookie';

// 컴포넌트 이름 SigninForm으로 변경
const SigninForm: FC = () => {
  const router = useRouter();

  const [nickname, setNickname] = useState('');
  const [isNicknameFocused, setIsNicknameFocused] = useState(false);

  const [smoking, setSmoking] = useState<number | ''>( '');
  const [drinking, setDrinking] = useState<number | ''>( '');
  const [travelStyle, setTravelStyle] = useState('');
  const [favoriteFood, setFavoriteFood] = useState('');
  const [groupType, setGroupType] = useState('');
  const [attractionType, setAttractionType] = useState<string[]>([]);

  const toggleAttractionType = (item: string) => {
    setAttractionType(prev => {
      const 이미선택됨 = prev.includes(item);
      if (이미선택됨) {
        return prev.filter(i => i !== item);
      } else {
        if (prev.length < 2) {
          return [...prev, item];
        }
        return prev;
      }
    });
  };

  const getClass = (base: string, isSelected: boolean) =>
    `${styles[base]} ${styles.selectBox} ${isSelected ? styles.selected : ''}`;

  const getLabelClass = (base: string) => `${styles[base]} ${styles.textLabel}`;

  const handleSubmit = async () => {
    const token = Cookies.get('auth_token');
    if (!token) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    if (!nickname.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }
    if (nickname.trim().length < 2 || nickname.trim().length > 20) {
      alert('닉네임은 2자 이상 20자 이하로 입력해주세요.');
      return;
    }

    if (smoking === '' || drinking === '' || !travelStyle || !favoriteFood || !groupType || attractionType.length === 0) {
      alert('모든 항목을 입력하거나 선택해주세요. (관광지 유형 최소 1개)');
      return;
    }

    try {
      const nicknameUpdateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/nickname`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ nickname: nickname.trim() }),
      });

      if (!nicknameUpdateResponse.ok) {
        const errorData = await nicknameUpdateResponse.json();
        alert(`닉네임 업데이트 실패: ${errorData.message || '알 수 없는 오류'}`);
        return;
      }

      const favoriteData = {
        smoking: Number(smoking),
        drinking: Number(drinking),
        travelStyle,
        favoriteFood,
        groupType,
        attractionType,
      };

      const favoriteSaveResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(favoriteData),
      });

      if (favoriteSaveResponse.ok) {
        alert('닉네임과 취향 정보가 성공적으로 저장되었습니다.');
        router.push('/home');
      } else {
        const errorData = await favoriteSaveResponse.json();
        alert(`취향 정보 저장 실패: ${errorData.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('정보 저장 중 오류가 발생했습니다.');
    }
  };
  
  // UI 부분은 signin/page.tsx에서 가져온 전체 구조를 유지합니다.
  // 최상위 div (className={styles.div}) 포함.
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

          <div className={styles.smoking}>
            <div className={styles.div3}>흡연 유무</div>
            <div className={styles.r1} />
            <div className={getClass('box2_1', smoking === 1)} onClick={() => setSmoking(1)} />
            <div className={getLabelClass('div4')} onClick={() => setSmoking(1)}>흡연함</div>
            <div className={getClass('box2_2', smoking === 0)} onClick={() => setSmoking(0)} />
            <div className={getLabelClass('div5')} onClick={() => setSmoking(0)}>흡연 안 함</div>
            <div className={styles.rrr11} />
            <div className={styles.result}>{smoking === 1 ? '흡연함' : smoking === 0 ? '흡연 안 함' : ''}</div>
          </div>

          <div className={styles.smoking}>
            <div className={styles.div3}>음주 유무</div>
            <div className={styles.r1} />
            <div className={getClass('box3_1', drinking === 1)} onClick={() => setDrinking(1)} />
            <div className={getLabelClass('div4')} onClick={() => setDrinking(1)}>음주함</div>
            <div className={getClass('box3_2', drinking === 0)} onClick={() => setDrinking(0)} />
            <div className={getLabelClass('div5')} onClick={() => setDrinking(0)}>음주 안 함</div>
            <div className={styles.rrr11} />
            <div className={styles.result}>{drinking === 1 ? '음주함' : drinking === 0 ? '음주 안 함' : ''}</div>
          </div>

          <div className={styles.smoking}>
            <div className={styles.div3}>여행 스타일</div>
            <div className={styles.r1} />
            <div className={getClass('box4_1', travelStyle === '맛집 위주')} onClick={() => setTravelStyle('맛집 위주')} />
            <div className={getLabelClass('div4')} onClick={() => setTravelStyle('맛집 위주')}>맛집 위주</div>
            <div className={getClass('box4_2', travelStyle === '관광지 위주')} onClick={() => setTravelStyle('관광지 위주')} />
            <div className={getLabelClass('div13')} onClick={() => setTravelStyle('관광지 위주')}>관광지 위주</div>
            <div className={styles.rrr11} />
            <div className={styles.result}>{travelStyle}</div>
          </div>

          <div className={styles.likeFood}>
            <div className={styles.div3}>좋아하는 음식</div>
            <div className={styles.r1} />
            <div className={getClass('box5_1', favoriteFood === '육류')} onClick={() => setFavoriteFood('육류')} />
            <div className={getLabelClass('div16')} onClick={() => setFavoriteFood('육류')}>육류</div>
            <div className={getClass('box5_2', favoriteFood === '해산물')} onClick={() => setFavoriteFood('해산물')} />
            <div className={getLabelClass('div17')} onClick={() => setFavoriteFood('해산물')}>해산물</div>
            <div className={getClass('box5_3', favoriteFood === '면류')} onClick={() => setFavoriteFood('면류')} />
            <div className={getLabelClass('div18')} onClick={() => setFavoriteFood('면류')}>면류</div>
            <div className={getClass('box5_4', favoriteFood === '밥류')} onClick={() => setFavoriteFood('밥류')} />
            <div className={getLabelClass('div19')} onClick={() => setFavoriteFood('밥류')}>밥류</div>
            <div className={styles.rrr11} />
            <div className={styles.result}>{favoriteFood}</div>
          </div>

          <div className={styles.headcount}>
            <div className={styles.div3}>여행 인원</div>
            <div className={styles.r1} />
            <div className={getClass('box7_1', groupType === '1인&2인')} onClick={() => setGroupType('1인&2인')} />
            <div className={getLabelClass('div4')} onClick={() => setGroupType('1인&2인')}>1인&2인</div>
            <div className={getClass('box7_2', groupType === '3인 이상')} onClick={() => setGroupType('3인 이상')} />
            <div className={getLabelClass('div13')} onClick={() => setGroupType('3인 이상')}>3인 이상</div>
            <div className={styles.rrr16} />
            <div className={styles.result}>{groupType}</div>
          </div>

          <div className={styles.theme}>
            <div className={styles.div3}>관광지 유형 (최대 2개)</div>
            <div className={styles.r1} />
            <div className={getClass('box8_1', attractionType.includes('자연'))} onClick={() => toggleAttractionType('자연')} />
            <div className={getLabelClass('div32')} onClick={() => toggleAttractionType('자연')}>자연</div>
            <div className={getClass('box8_2', attractionType.includes('축제'))} onClick={() => toggleAttractionType('축제')} />
            <div className={getLabelClass('div33')} onClick={() => toggleAttractionType('축제')}>축제</div>
            <div className={getClass('box8_3', attractionType.includes('역사'))} onClick={() => toggleAttractionType('역사')} />
            <div className={getLabelClass('div34')} onClick={() => toggleAttractionType('역사')}>역사</div>
            <div className={getClass('box8_4', attractionType.includes('액티비티'))} onClick={() => toggleAttractionType('액티비티')} />
            <div className={getLabelClass('div35')} onClick={() => toggleAttractionType('액티비티')}>액티비티</div>
            <div className={getClass('box8_5', attractionType.includes('랜드마크'))} onClick={() => toggleAttractionType('랜드마크')} />
            <div className={getLabelClass('div36')} onClick={() => toggleAttractionType('랜드마크')}>랜드마크</div>
            <div className={styles.rrr17} />
            <div className={styles.result}>{attractionType.join(', ')}</div>
          </div>

          <div className={styles.sign} onClick={handleSubmit}>
            <div className={`${styles.signbutton} ${styles.pointer}`} />
            <div className={styles.div38}>회원 가입하기</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SigninForm; 