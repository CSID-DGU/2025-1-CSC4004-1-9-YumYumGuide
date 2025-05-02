'use client';
import type { NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../componets/nav';
import Image from 'next/image';
import styles from './profile.module.css';

/** 디폴트 값 (최초 방문 또는 저장 전) */
const DEFAULT_NICKNAME = 'LoveTrip';
const DEFAULT_EMAIL    = 'LOVETRIP@naver.com';

const Profile = () => {
  const router = useRouter();

  /* 상태 */
  const [nickname, setNickname] = useState<string>(DEFAULT_NICKNAME);

  /* 최초 마운트 시 localStorage → 상태 */
  useEffect(() => {
    const stored = localStorage.getItem('nickname');
    if (stored) setNickname(stored);

    /* 다른 탭에서 storage 변경될 때 실시간 반영 */
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'nickname') setNickname(e.newValue ?? DEFAULT_NICKNAME);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  /* 네비게이션 함수 */
  const handleSettingClick   = () => router.push('/profile/edit');
  const handleFavorClick     = () => router.push('/profile/preferences');
  const handleLogoutClick    = () => console.log('로그아웃 클릭됨');

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
      <div className={styles.lovetrip}>{nickname}</div>
      <div className={styles.lovetripgmailcom}>{DEFAULT_EMAIL}</div>

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