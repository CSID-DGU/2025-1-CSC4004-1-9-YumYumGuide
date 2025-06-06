'use client';
import Nav from './componets/nav';
import Signature from './componets/handerWrittenSignature';
import { useState, useEffect } from 'react';
import HomePage from './home/page';
export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);
        const response = await fetch('/api/sample');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setMovies(result.data);
        setPagination(result.pagination);
      } catch (err) {
        // setError(err.message);
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
    <div>
      <HomePage />
    </div>
  );
}
