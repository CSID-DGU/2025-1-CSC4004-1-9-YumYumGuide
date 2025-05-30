import React from 'react';
import Image from 'next/image';
import styles from '../login.module.css';

interface LoginFormProps {
  email: string;
  password: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  error
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div className={styles.email}>
        <div className={styles.div2}>이메일</div>
        <div className={styles.box1} />
        <input
          type="email"
          value={email}
          onChange={onEmailChange}
          className={styles.emailInput}
          placeholder="이메일을 입력하세요"
        />
      </div>

      <div className={styles.password}>
        <div className={styles.div3}>비밀번호</div>
        <div className={styles.box2} />
        <input
          type="password"
          value={password}
          onChange={onPasswordChange}
          className={styles.passwordInput}
          placeholder="비밀번호를 입력하세요"
        />
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <button type="submit" className={styles.loginButton}>
        <div className={styles.div4}>로그인</div>
      </button>
    </form>
  );
};

export default LoginForm; 