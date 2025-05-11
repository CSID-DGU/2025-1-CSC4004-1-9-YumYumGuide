import React from 'react';
import Image from 'next/image';

const HomeWithSchedule = () => {
  return (
    <div className="w-full max-w-md mx-auto p-4 flex flex-col gap-6">
      {/* 현재 날씨 */}
      <section className="mb-2">
        <h2 className="text-lg font-bold mb-2">현재 날씨</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {['10 am', '11 am', '12 pm', '01 pm'].map((time, idx) => (
            <div key={time} className="flex flex-col items-center bg-white rounded-lg shadow p-2 w-full">
              <div className="text-xs text-gray-500 mb-1">{time}</div>
              <div className="text-2xl">☁️</div>
              <div className="text-base font-semibold">{16 + idx}°</div>
            </div>
          ))}
        </div>
      </section>
      {/* 다음 일정 */}
      <section>
        <h2 className="text-lg font-bold mb-2">다음 일정</h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4 bg-white rounded-xl shadow p-3 w-full max-w-full">
            <Image
              src="https://placehold.co/80x80"
              alt="도쿄타워"
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />
            <div className="flex flex-col flex-1 min-w-0">
              <div className="font-bold text-base truncate">도쿄타워</div>
              <div className="text-gray-500 text-sm">⭐ 4.7 (512)</div>
              <div className="text-gray-400 text-xs truncate">Minato City, Tokyo</div>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white rounded-xl shadow p-3 w-full max-w-full">
            <Image
              src="https://placehold.co/80x80"
              alt="스카이트리"
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />
            <div className="flex flex-col flex-1 min-w-0">
              <div className="font-bold text-base truncate">스카이트리</div>
              <div className="text-gray-500 text-sm">⭐ 4.3 (320)</div>
              <div className="text-gray-400 text-xs truncate">Sumida City, Tokyo</div>
            </div>
          </div>
        </div>
      </section>
      {/* 현재 이벤트 */}
      <section>
        <h2 className="text-lg font-bold mb-2">현재 이벤트</h2>
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center gap-4 bg-white rounded-xl shadow p-3 w-full max-w-full">
            <Image
              src="https://placehold.co/80x80"
              alt="우에노 벚꽃 축제"
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />
            <div className="text-base font-medium truncate">우에노 벚꽃 축제</div>
          </div>
          <div className="flex items-center gap-4 bg-white rounded-xl shadow p-3 w-full max-w-full">
            <Image
              src="https://placehold.co/80x80"
              alt="지요다 벚꽃 축제"
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />
            <div className="text-base font-medium truncate">지요다 벚꽃 축제</div>
          </div>
        </div>
      </section>
      {/* 편의점 정보 */}
      <section>
        <h2 className="text-lg font-bold mb-2">편의점 정보</h2>
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center gap-4 bg-white rounded-xl shadow p-3 w-full max-w-full">
            <Image
              src="https://placehold.co/80x80"
              alt="훼미리 마트"
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />
            <div className="text-base font-medium truncate">훼미리 마트</div>
          </div>
          <div className="flex items-center gap-4 bg-white rounded-xl shadow p-3 w-full max-w-full">
            <Image
              src="https://placehold.co/80x80"
              alt="로손"
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />
            <div className="text-base font-medium truncate">로손</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeWithSchedule;
