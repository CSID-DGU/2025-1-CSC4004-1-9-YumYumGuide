import React from 'react';
import Image from 'next/image';
import styles from '../login.module.css';

interface SocialLoginProps {
  onGoogleLogin: () => void;
  onKakaoLogin: () => void;
}

const SocialLogin: React.FC<SocialLoginProps> = ({
  onGoogleLogin,
  onKakaoLogin
}) => {
  return (
    <div className={styles.socialLogin}>
      <div className={styles.div5}>소셜 로그인</div>
      <div className={styles.socialButtons}>
        <button onClick={onGoogleLogin} className={styles.googleButton}>
          <Image
            className={styles.googleIcon}
            width={24}
            height={24}
            alt="Google"
            src="/icons/google.svg"
          />
          <span>Google</span>
        </button>
        <button onClick={onKakaoLogin} className={styles.kakaoButton}>
          <Image
            className={styles.kakaoIcon}
            width={24}
            height={24}
            alt="Kakao"
            src="/icons/kakao.svg"
          />
          <span>Kakao</span>
        </button>
      </div>
    </div>
  );
};

export default SocialLogin; 