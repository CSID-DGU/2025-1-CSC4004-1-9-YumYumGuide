import React, {useState} from 'react';
import { useRouter } from 'next/navigation';
import styles from './SearchBar.module.css';

export default function SearchBar() {
    const [value, setValue] = useState("");
    const placeholder = "검색하기..."
    const router = useRouter();

    const handleSubmit = (e: any) => {
        e.preventDefault();
        router.push(`/search/${value}`)
    }
 

   return (
    <form className={styles.searchBar} onSubmit={handleSubmit}>
      <span className={styles.searchIcon}>
        {/* 아이콘 SVG */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="#C0C0C0" strokeWidth="2"/>
          <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#C0C0C0" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </span>
      <input
        className={styles.searchInput}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}