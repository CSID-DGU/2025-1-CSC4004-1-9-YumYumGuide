'use client'; // 이 줄을 추가하세요

import Nav from './componets/nav';

export default function Home() {
  function moveTrip() {
    window.location.href = '/newtrip';
  }
  
  return (
    <>
      <div>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded" 
          onClick={() => moveTrip()}
        >
          Go to Trip Detail
        </button>
      </div>
      <Nav />
    </>
  );
}