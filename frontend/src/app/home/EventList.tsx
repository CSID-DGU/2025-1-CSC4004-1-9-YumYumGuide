'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

type Event = {
  _id: string;
  attraction: string;
  image: string;
  date: string;
  description?: string;
  address?: string;
  price?: string;
};

const EventList = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/home/events/future`);
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data);
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
            onClick={() => setSelectedEvent(event)}
          >
            <div className="flex items-center gap-4">
              <Image
                src={event.image || '/icons/80x80.svg'}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/default_image.png';
                }}
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

      {/* 팝업 모달 */}
      {selectedEvent && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-100"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white rounded-xl p-6 w-[400px] relative"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={selectedEvent.image}
              alt={selectedEvent.attraction}
              className="rounded-lg w-full h-52 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/default_image.png';
              }}
            />
            <h2 className="text-xl font-bold mt-4">{selectedEvent.attraction}</h2>
            {/* <p className="text-gray-500 mb-1">{selectedEvent.address}</p> */}
            <div className="flex justify-between items-center text-gray-500 mb-1">
              <span>{selectedEvent.date}</span>
              <span>{selectedEvent.price ? `${selectedEvent.price}원` : '무료'}</span>
            </div>
            <p className="mt-2 text-gray-600 leading-relaxed whitespace-pre-line break-words max-h-[200px] overflow-y-auto">
              {selectedEvent.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;
