'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ScheduleList from './ScheduleList';
import EventList from './EventList';
import WeatherList from './WeatherList';
import StoreList from './StoreList';
import Nav from '../componets/nav';

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    // 쿠키에서 auth_token 확인
    const cookies = document.cookie.split(';');
    console.log('All cookies:', cookies);
    
    const authToken = cookies.find(cookie => 
      cookie.trim().startsWith('auth_token=')
    );
    
    console.log('Auth token found:', authToken);

    if (!authToken) {
      console.log('No auth token found, redirecting to login');
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="w-full px-5 flex flex-col gap-6 min-h-screen pt-10 pb-20">
      <WeatherList />
      <ScheduleList />
      <EventList />
      <StoreList />
      <Nav />
    </div>
  );
};

export default HomePage;
