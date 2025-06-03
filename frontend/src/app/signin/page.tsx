'use client';

import { useState, FC } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import styles from './signin.module.css';
import Cookies from 'js-cookie';
import PreferenceItemsForm from '../profile/preferences/components/PreferenceItemsForm';

const SigninPage: FC = () => {
  const router = useRouter();

  const [nickname, setNickname] = useState('');
  const [isNicknameFocused, setIsNicknameFocused] = useState(false);

  const [smoking, setSmoking] = useState<number | null>(null);
  const [drinking, setDrinking] = useState<number | null>(null);
  const [travelStyle, setTravelStyle] = useState<number | null>(null);
  const [favoriteFood, setFavoriteFood] = useState<number | null>(null);
  const [groupType, setGroupType] = useState<number | null>(null);
  const [attractionType, setAttractionType] = useState<string[]>([]);

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
    
    if (smoking === null) {
      alert('흡연 유무를 선택해주세요.');
      return;
    }
    if (drinking === null) {
      alert('음주 유무를 선택해주세요.');
      return;
    }
    if (travelStyle === null) {
      alert('여행 스타일을 선택해주세요.');
      return;
    }
    if (favoriteFood === null) {
      alert('좋아하는 음식을 선택해주세요.');
      return;
    }
    if (groupType === null) {
      alert('여행 인원을 선택해주세요.');
      return;
    }
    if (attractionType.length === 0) {
      alert('관광지 유형을 최소 1개 선택해주세요.');
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
        smoking,
        drinking,
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
      
      <div className={styles.in}>
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
        </div>

      <div className={styles.inners}>  
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

        <div className={styles.sign} onClick={handleSubmit}>
          <div className={`${styles.signbutton} ${styles.pointer}`} />
          <div className={styles.div38}>회원 가입하기</div>
        </div>
      </div>
    </div>
  );
};

export default SigninPage;