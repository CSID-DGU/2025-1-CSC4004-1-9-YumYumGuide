import React from 'react';
import Image from 'next/image';
import styles from '../profile.module.css';

interface ProfileInfoProps {
  nickname: string;
  isLoading: boolean;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ nickname, isLoading }) => {
  return (
    <>
      <Image
        className={styles.profileIcon}
        width={64}
        height={64}
        alt="프로필 이미지"
        src="/icons/profile_icon.svg"
      />
      <div className={styles.lovetrip}>
        {isLoading ? '로딩 중...' : nickname}
      </div>
    </>
  );
};

export default ProfileInfo; 