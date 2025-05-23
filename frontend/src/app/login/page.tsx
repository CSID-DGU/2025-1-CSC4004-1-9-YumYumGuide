import Image from 'next/image';
import styles from './login.module.css';

const Login = () => {
  return (
    <div className={styles.div}>
      <Image className={styles.backgroundIcon} width={500} height={980} alt="" src="/icons/background.png" />
      <Image className={styles.logoIcon} width={218} height={126} alt="" src="/icons/logo.svg" />
      <div className={styles.kakaoSection}>
        <div className={styles.boxKakao} />
        <Image className={styles.kakaotalkIcon} width={30} height={30} alt="" src="/icons/kakaotalk.svg" />
        <div className={styles.div1}>카카오로 3초 만에 시작하기</div>
      </div>
      <div className={styles.naverSection}>
        <div className={styles.boxNaver} />
        <Image className={styles.kakaotalkIcon} width={30} height={30} alt="" src="/icons/naver.svg" />
        <div className={styles.div1}>네이버로 3초 만에 시작하기</div>
      </div>
    </div>
  );
};

export default Login;
