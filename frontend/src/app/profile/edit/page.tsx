'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { NextPage } from 'next';
import Image from 'next/image';
import styles from './editProfile.module.css';

const ProfileEdit: NextPage = () => {
  const [nickname, setNickname] = useState('LoveTrip');
  const [selectedCountry, setSelectedCountry] = useState('일본');
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();

  const handleSave = () => {
    setIsSaved(true);

    console.log('저장된 닉네임:', nickname);
    console.log('저장된 국가:', selectedCountry);

    setTimeout(() => {
      setIsSaved(false);
    }, 1000);
  };

  const handleBack = () => {
    router.back();
  };

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