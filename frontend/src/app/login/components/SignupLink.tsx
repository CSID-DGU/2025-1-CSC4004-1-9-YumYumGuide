import React from 'react';
import { useRouter } from 'next/navigation';
import styles from '../login.module.css';

const SignupLink: React.FC = () => {
  const router = useRouter();

  return (
    <div className={styles.signupLink} onClick={() => router.push('/signup')}>
      <div className={styles.div6}>회원가입</div>
      <div className={styles.arrowIcon} />
    </div>
  );
};

export default SignupLink; 