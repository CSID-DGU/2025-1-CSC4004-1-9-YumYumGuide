'use client';
import type { NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../componets/nav';
import Image from 'next/image';
import styles from './profile.module.css';
import Cookies from 'js-cookie';

// const DEFAULT_NICKNAME = 'LoveTrip'; // 기본 닉네임 사용하지 않음

const Profile: NextPage = () => {
  const router = useRouter();
  const [nickname, setNickname] = useState<string>(''); // 초기값을 빈 문자열로
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true); // 로딩 시작
      const token = Cookies.get('auth_token');
      if (!token) {
        console.error('[ProfilePage] No auth token found, redirecting to login.');
        router.push('/login');
        return;
      }
      console.log('[ProfilePage] Token found, fetching user...');
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        console.log('[ProfilePage] /api/user/me response status:', response.status);
        const responseBody = await response.text();
        console.log('[ProfilePage] /api/user/me response body:', responseBody);

        if (response.ok) {
          const userData = JSON.parse(responseBody);
          console.log('[ProfilePage] User data received:', userData);
          if (userData && userData.username) {
            setNickname(userData.username);
          } else {
            // setNickname(DEFAULT_NICKNAME); // 기본 닉네임 설정 제거
            console.warn('[ProfilePage] User data received but username is missing. Data:', userData);
            // 필요하다면 여기서 사용자에게 다른 메시지를 보여주거나 로그인 페이지로 리디렉션 할 수 있습니다.
            setNickname('사용자명 없음'); // 또는 다른 적절한 메시지
          }
        } else if (response.status === 401) {
          console.error('[ProfilePage] Unauthorized, redirecting to login.');
          Cookies.remove('auth_token');
          router.push('/login');
        } else {
          console.error('[ProfilePage] Failed to fetch user data. Status:', response.status, 'Body:', responseBody);
          setNickname('정보 로드 실패'); // 오류 시 메시지
        }
      } catch (error) {
        console.error('[ProfilePage] Error fetching user data:', error);
        setNickname('정보 로드 오류'); // 오류 시 메시지
      } finally {
        setIsLoading(false); // 로딩 완료
      }
    };

    fetchUser();
  }, [router]);

  /* 네비게이션 함수 */
  const handleSettingClick   = () => router.push('/profile/edit');
  const handleFavorClick     = () => router.push('/profile/preferences');
  const handleLogoutClick    = () => {
    Cookies.remove('auth_token');
    router.push('/login');
  };

  /* UI */
  return (
    <div className={styles.div}>
      <div className={styles.div1}>프로필</div>

      <Image
        className={styles.profileIcon}
        width={64}
        height={64}
        alt="프로필 이미지"
        src="/icons/profile_icon.svg"
      />

      {/* 닉네임 / 이메일 */}
      <div className={styles.lovetrip}>
        {isLoading ? '로딩 중...' : nickname}
      </div>

      {/* 메뉴 3개 */}
      <div className={styles.menu}>
        {/* 로그아웃 */}
        <div className={styles.logoutGroup} onClick={handleLogoutClick}>
          <div className={styles.logoutGroupChild} />
          <div className={styles.logout}>
            <div className={styles.div2}>로그아웃</div>
            <Image className={styles.logoutIcon} width={17} height={18} alt="" src="/icons/logout.svg" />
            <Image className={styles.arrowIcon} width={6} height={12} alt="" src="/icons/arrow.svg" />
          </div>
        </div>

        {/* 프로필 설정 */}
        <div className={styles.settingGroup} onClick={handleSettingClick}>
          <div className={styles.settingGroupChild} />
          <div className={styles.setting}>
            <div className={styles.div3}>프로필 설정</div>
            <Image className={styles.profileIcon2} width={16} height={18} alt="" src="/icons/profile2.svg" />
            <Image className={styles.arrowIcon} width={6} height={12} alt="" src="/icons/arrow.svg" />
          </div>
        </div>

        {/* 취향 설정 */}
        <div className={styles.favorGroup} onClick={handleFavorClick}>
          <div className={styles.favorGroupChild} />
          <div className={styles.favor}>
            <div className={styles.div4}>사용자 취향 설정</div>
            <Image className={styles.favoriteIcon} width={24} height={20} alt="" src="/icons/favorite.svg" />
            <Image className={styles.arrowIcon} width={6} height={12} alt="" src="/icons/arrow.svg" />
          </div>
        </div>
      </div>

      {/* 구분선 */}
      <Image className={styles.divisonLineIcon}  width={335} height={2} alt="" src="/icons/division_line.svg" />
      <Image className={styles.divisonLine2Icon} width={335} height={2} alt="" src="/icons/division_line.svg" />

      <Nav />
    </div>
  );
};

export default Profile;