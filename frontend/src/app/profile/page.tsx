'use client';

import type { NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../componets/nav';
import Image from 'next/image';
import styles from './profile.module.css';
import Cookies from 'js-cookie';
import Header from './components/Header';
import ProfileInfo from './components/ProfileInfo';
import MenuList from './components/MenuList';

const Profile: NextPage = () => {
  const router = useRouter();
  const [nickname, setNickname] = useState<string>('사용자명 없음');
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const fetchUser = async () => {
      setIsLoading(true);
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
            console.warn('[ProfilePage] User data received but username is missing. Data:', userData);
            setNickname('사용자명 없음');
          }
        } else if (response.status === 401) {
          console.error('[ProfilePage] Unauthorized, redirecting to login.');
          Cookies.remove('auth_token');
          router.push('/login');
        } else {
          console.error('[ProfilePage] Failed to fetch user data. Status:', response.status, 'Body:', responseBody);
          setNickname('정보 로드 실패');
        }
      } catch (error) {
        console.error('[ProfilePage] Error fetching user data:', error);
        setNickname('정보 로드 오류');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router, isClient]);

  /* 네비게이션 함수 */
  const handleSettingClick = () => router.push('/profile/edit');
  const handleFavorClick = () => router.push('/profile/preferences');
  const handleLogoutClick = () => {
    Cookies.remove('auth_token');
    router.push('/login');
  };

  return (
    <div className={styles.div}>
      <Header goBack={() => router.back()} />
      <ProfileInfo nickname={nickname} isLoading={isLoading} />
      <MenuList
        onLogoutClick={handleLogoutClick}
        onSettingClick={handleSettingClick}
        onFavorClick={handleFavorClick}
      />
      <Image className={styles.divisonLineIcon} width={335} height={2} alt="" src="/icons/division_line.svg" />
      <Image className={styles.divisonLine2Icon} width={335} height={2} alt="" src="/icons/division_line.svg" />
      <Nav />
    </div>
  );
};

export default Profile;