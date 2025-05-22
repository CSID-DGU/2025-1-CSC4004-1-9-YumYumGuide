import React, { useEffect, useState } from 'react';
import Image from 'next/image';

type Event = {
  _id: string;
  attraction: string;
  image: string;
  date: string;
};

const EventList = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:5050/api/home/events/future');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        console.log(data, 'data');
        // 이번달의 시작 월 구하기
        const today = new Date();
        const thisMonth = today.getMonth() + 1;

        // date에서 월을 파싱해서 이번달 이상만 남기고 2개만 표시
        const filteredEvents = data
          .filter((event: Event) => {
            if (!event.date) return false;
            // date가 'M.D' 또는 'M.D-M.D' 형식이므로, 앞의 월만 추출
            const monthStr = event.date.split('.')[0];
            const month = parseInt(monthStr, 10);
            return month >= thisMonth;
          })
          .slice(0, 2);
        console.log(filteredEvents, 'filteredEvents');
        setEvents(filteredEvents);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-[200px]">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <p className="text-2xl font-semibold mb-2">현재 이벤트</p>
      {events.length === 0 ? (
        <div className="text-gray-500 text-center py-4">현재 진행 중인 이벤트가 없습니다.</div>
      ) : (
        events.map((event) => (
          <div
            className="flex items-center justify-between bg-white rounded-xl shadow p-3 w-full hover:bg-gray-50 cursor-pointer h-[100px]"
            key={event._id}
          >
            <div className="flex items-center gap-4">
              <Image
                src={event.image || '/icons/80x80.svg'}
                alt={event.attraction}
                width={80}
                height={80}
                className="rounded-lg object-cover"
              />
              <div className="flex flex-col">
                <div className="text-base font-medium truncate">{event.attraction}</div>
                <div className="text-sm text-gray-500">{event.date} 예정</div>
              </div>
            </div>
            <Image src="/icons/arrow.svg" alt="화살표" width={24} height={24} className="mr-2" />
          </div>
        ))
      )}
    </div>
  );
};

export default EventList;
