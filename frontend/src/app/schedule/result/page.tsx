import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import styles from './result.module.css';

const ScheduleResultPage: React.FC = () => {
  const router = useRouter();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const token = Cookies.get('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/schedule`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSchedules(data.data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (scheduleId: string, dayIndex: number, eventIndex: number) => {
    if (!confirm('정말로 이 장소를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = Cookies.get('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/schedule/${scheduleId}/days/${dayIndex}/events/${eventIndex}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // 삭제 성공 시 일정 목록 업데이트
        setSchedules(prevSchedules => {
          return prevSchedules.map(schedule => {
            if (schedule._id === scheduleId) {
              const updatedDays = [...schedule.days];
              updatedDays[dayIndex] = {
                ...updatedDays[dayIndex],
                events: updatedDays[dayIndex].events.filter((_, index) => index !== eventIndex)
              };
              return { ...schedule, days: updatedDays };
            }
            return schedule;
          });
        });
        alert('장소가 삭제되었습니다.');
      } else {
        const errorData = await response.json();
        alert(`삭제 실패: ${errorData.message || '알 수 없는 오류가 발생했습니다.'}`);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('장소 삭제 중 오류가 발생했습니다.');
    }
  };

  // 로딩 상태 처리
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>일정을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우 처리
  if (!schedule) {
    return (
      <div className="min-h-screen bg-[#fafbfa] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">일정을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.scheduleContainer}>
      {schedules.map((schedule) => (
        <div key={schedule._id} className={styles.scheduleCard}>
          {schedule.days.map((day, dayIndex) => (
            <div key={dayIndex} className={styles.dayContainer}>
              <h3>Day {day.day}</h3>
              {day.events.map((event, eventIndex) => (
                <div key={eventIndex} className={styles.eventCard}>
                  <h4>{event.name}</h4>
                  <p>{event.description}</p>
                  <p>시간: {event.startTime} - {event.endTime}</p>
                  <button
                    onClick={() => handleDeleteEvent(schedule._id, dayIndex, eventIndex)}
                    className={styles.deleteButton}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ScheduleResultPage; 