'use client';
import Nav from './componets/nav';
import { useState, useEffect } from 'react';
import HomePage from './home/page';
export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    console.log('useEffect 실행됨');
    async function fetchMovies() {
      try {
        setLoading(true);
        const response = await fetch('/api/sample');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('받은 데이터:', result); // 전체 응답 확인
        setMovies(result.data);
        setPagination(result.pagination);
      } catch (err) {
        setError(err.message);
        console.error('영화 데이터 가져오기 오류:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, [page]);

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  if (loading) return <div className="p-4">로딩 중...</div>;
  if (error) return <div className="p-4 text-red-500">오류: {error}</div>;

  return (
<<<<<<< HEAD
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <button 
          style={{ 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            padding: '0.5rem 1rem', 
            borderRadius: '0.25rem',
            border: 'none',
            marginRight: '0.5rem',
            cursor: 'pointer'
          }} 
          // onClick={moveTrip}
        >
          Go to Trip Detail
        </button>
        
        <button 
          style={{ 
            backgroundColor: loading ? '#9ca3af' : '#22c55e', 
            color: 'white', 
            padding: '0.5rem 1rem', 
            borderRadius: '0.25rem',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer'
          }} 
          // onClick={fetchSampleData}
          disabled={loading}
        >
          {loading ? '로딩 중...' : '샘플 데이터 불러오기'}
        </button>
      </div>
      
      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fee2e2', 
          color: '#b91c1c',
          borderRadius: '0.25rem',
          marginBottom: '1rem'
        }}>
          에러: {error}
        </div>
      )}
      
      
      
=======
    <div>

      <HomePage />
>>>>>>> origin/main
      <Nav />
    </div>
  );
}
