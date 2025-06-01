'use client';

import Image from 'next/image';
import styles from './login.module.css';

const Login = () => {
  const handleKakaoLogin = () => {
    // 백엔드의 카카오 로그인 엔드포인트로 리다이렉트
    window.location.href = 'http://localhost:5000/api/auth/kakao';
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/kakao`;
  };

  return (
    <div className={styles.div}>
      <Image className={styles.backgroundIcon} width={500} height={980} alt="" src="/icons/background.png" />
      <Image className={styles.logoIcon} width={218} height={126} alt="" src="/icons/logo.svg" />

      <div className={styles.kakaoSection} onClick={handleKakaoLogin} style={{ cursor: 'pointer' }}>
        <div className={styles.boxKakao} />
        <Image className={styles.kakaotalkIcon} width={30} height={30} alt="" src="/icons/kakaotalk.svg" />
        <div className={styles.div1}>카카오로 3초 만에 시작하기</div>
      </div>
    </div>
  );
};

export default Login;
