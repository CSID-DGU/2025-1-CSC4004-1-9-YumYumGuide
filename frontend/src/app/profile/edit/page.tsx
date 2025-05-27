'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { NextPage } from 'next';
import Image from 'next/image';
import styles from './editProfile.module.css';
import Cookies from 'js-cookie';

const ProfileEdit: NextPage = () => {
  const [nickname, setNickname] = useState('');
  const [initialNickname, setInitialNickname] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('일본');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);
      const token = Cookies.get('auth_token');
      if (!token) {
        console.error('[ProfileEditPage] No auth token found, redirecting to login.');
        router.push('/login');
        return;
      }
      console.log('[ProfileEditPage] Token found, fetching user...');
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        console.log('[ProfileEditPage] /api/user/me response status:', response.status);
        const responseBody = await response.text();
        console.log('[ProfileEditPage] /api/user/me response body:', responseBody);

        if (response.ok) {
          const userData = JSON.parse(responseBody);
          console.log('[ProfileEditPage] User data received:', userData);
          if (userData && userData.username) {
            setNickname(userData.username);
            setInitialNickname(userData.username);
          } else {
            setError('닉네임을 불러오지 못했습니다. 응답 확인 필요.');
            console.warn('[ProfileEditPage] User data received but username is missing. Data:', userData);
          }
        } else if (response.status === 401) {
          console.error('[ProfileEditPage] Unauthorized, redirecting to login.');
          router.push('/login');
        } else {
          setError('닉네임 로딩 중 오류가 발생했습니다. Status: ' + response.status);
          console.error('[ProfileEditPage] Failed to fetch user data. Status:', response.status, 'Body:', responseBody);
        }
      } catch (err) {
        setError('닉네임 로딩 중 네트워크 오류가 발생했습니다.');
        console.error('[ProfileEditPage] Error fetching user data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleSave = async () => {
    setError(null);
    const token = Cookies.get('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }
    if (nickname.trim().length < 2 || nickname.trim().length > 20) {
      setError('닉네임은 2자 이상 20자 이하로 입력해주세요.');
      return;
    }
    if (nickname.trim() === initialNickname) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 1000);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/nickname`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ nickname: nickname.trim() }),
      });

      if (response.ok) {
        setIsSaved(true);
        setInitialNickname(nickname.trim());
        setTimeout(() => {
          setIsSaved(false);
        }, 1000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || '닉네임 저장에 실패했습니다.');
      }
    } catch (err) {
      setError('닉네임 저장 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return <div className={styles.div}>Loading...</div>;
  }

  return (
    <div className={styles.div}>
      <div className={styles.div1}>프로필 설정</div>

      <Image
        className={`${styles.saveIcon} ${isSaved ? styles.saved : ''}`}
        width={44}
        height={44}
        alt="저장"
        src="/icons/save.svg"
        onClick={handleSave}
      />
      <Image
        className={styles.backIcon}
        width={44}
        height={44}
        alt="뒤로"
        src="/icons/back.svg"
        onClick={handleBack}
      />
      <Image
        className={styles.profileIcon}
        width={64}
        height={64}
        alt="프로필 아이콘"
        src="/icons/profile_icon.svg"
      />
      <div className={styles.div2}>닉네임</div>
      <div className={styles.box1} />
      <input
        className={styles.nicknameInput}
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="닉네임을 입력하세요"
      />
      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.country}>
        <div className={styles.div3}>여행 국가</div>
        <div className={styles.r1} />
        <div
          className={`${styles.box1_1} ${selectedCountry === '일본' ? styles.selected : ''}`}
          onClick={() => setSelectedCountry('일본')}
        />
        <div className={styles.div4}>일본</div>
        <div
          className={`${styles.box1_2} ${selectedCountry === '태국' ? styles.selected : ''}`}
          onClick={() => setSelectedCountry('태국')}
        />
        <div className={styles.div5}>태국</div>
        <div className={styles.rrr1} />
        <div className={styles.div6}>{selectedCountry}</div>
      </div>
    </div>
  );
};

export default ProfileEdit;