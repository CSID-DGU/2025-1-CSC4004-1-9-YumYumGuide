'use client';

import type { NextPage } from 'next';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import Cookies from 'js-cookie';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import SocialLogin from './components/SocialLogin';
import SignupLink from './components/SignupLink';

const Login: NextPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        Cookies.set('auth_token', data.token);
        router.push('/profile');
      } else {
        const errorData = await response.json();
        setError(errorData.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
  };

  const handleKakaoLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/kakao`;
  };

  return (
    <div className={styles.div}>
      <Header />
      <LoginForm
        email={email}
        password={password}
        onEmailChange={(e) => setEmail(e.target.value)}
        onPasswordChange={(e) => setPassword(e.target.value)}
        onSubmit={handleSubmit}
        error={error}
      />
      <SocialLogin
        onGoogleLogin={handleGoogleLogin}
        onKakaoLogin={handleKakaoLogin}
      />
      <SignupLink />
    </div>
  );
};

export default Login;
