'use client';
import type { NextPage } from 'next';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './editProfile.module.css';

/* 기본 프로필  */
const DEFAULT_PROFILE = {
  nickname: 'LoveTrip',
  email: 'LoveTrip@naver.com',
  account: 'naver' as 'naver' | 'kakao',
};

const ProfileEdit = () => {
  const router = useRouter();

  /* 상태 */
  const [nickname, setNickname] = useState(DEFAULT_PROFILE.nickname);
  const [email, setEmail] = useState(DEFAULT_PROFILE.email);
  const [account, setAccount] = useState<'naver' | 'kakao'>(DEFAULT_PROFILE.account);
  const [saving, setSaving] = useState(false);

  /* (예시) 최초 로드 시 백엔드 호출 */
  useEffect(() => {

    const stored = localStorage.getItem('nickname');
    if (stored) setNickname(stored);
    
    (async () => {
      /** 실제 API 교체 지점 */
      await new Promise(r => setTimeout(r, 400));
      // const data = await (await fetch('/api/profile')).json();
      // setNickname(data.nickname);
      // setEmail(data.email);
      // setAccount(data.provider);  // 'naver' | 'kakao'
    })();
  }, []);

  /* 닉네임 저장 */
  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      localStorage.setItem('nickname', nickname);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.div}>
      {/* ← 뒤로가기 */}
      <button className={styles.backIcon} onClick={() => router.back()} aria-label="뒤로가기">
        <Image width={44} height={44} alt="" src="/icons/back.svg" />
      </button>

      <div className={styles.div1}>프로필 설정</div>

      {/* 저장 */}
      <button
        className={`${styles.saveIcon} ${saving ? styles.saveIconActive : ''}`}
        onClick={handleSave}
        aria-label="저장"
        disabled={saving}
      >
        <Image width={44} height={44} alt="" src="/icons/save.svg" />
      </button>

      {/* 프로필 사진 */}
      <Image
        className={styles.profileIcon}
        width={64}
        height={64}
        alt="프로필"
        src="/icons/profile_icon.svg"
      />

      {/* 닉네임 */}
      <div className={styles.div2}>닉네임</div>
      <input
        className={styles.box1}
        value={nickname}
        onChange={e => setNickname(e.target.value)}
        aria-label="닉네임"
      />

      {/* 연동 계정 */}
      <div className={styles.div3}>연동 계정</div>
      <div className={styles.box2}>{email}</div>

      {/* 네이버 / 카카오 */}
      <div className={`${styles.boxNaver} ${account === 'naver' ? styles.selected : ''}`}>
        <Image className={styles.platformIcon} width={32} height={32} alt="Naver" src="/icons/naver.svg" />
      </div>

      <div className={`${styles.boxKakao} ${account === 'kakao' ? styles.selected : ''}`}>
        <Image className={styles.platformIcon} width={32} height={32} alt="Kakao" src="/icons/kakaotalk.svg" />
      </div>
    </div>
  );
};

export default ProfileEdit;