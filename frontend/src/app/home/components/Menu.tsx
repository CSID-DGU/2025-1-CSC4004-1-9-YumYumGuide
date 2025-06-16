'use client';

import type { NextPage } from 'next';
import Image from 'next/image';
import styles from './Menu.module.css';

// Menu 컴포넌트가 받을 props 타입 정의
export interface MenuItem {
  id: string | number; // 고유 ID
  nameKr: string; // 한국어 이름
  nameJp: string; // 일본어 이름
  price: number; // 가격
  imageUrl: string; // 이미지 URL
  store?: string; // 편의점 종류 (예: "FamilyMart", "SevenEleven") - 선택적
}

interface MenuProps {
  item: MenuItem;
}

const Menu: NextPage<MenuProps> = ({ item }) => {
  return (
    <div className={styles.menu}>
      {/* <div className={styles.rectangle} />   styles.menu로 통합 */}
      <img
        className={styles.icon}
        width={53}
        height={53}
        alt={item.nameKr}
        src={item.imageUrl || '/images/placeholder.png'}
      />
      <div className={styles.textContainer}>
        <div className={styles.div}>{item.nameKr}</div>
        <div className={styles.div1}>{item.nameJp}</div>
      </div>
      <div className={styles.div2}>{`¥${item.price.toLocaleString()}`}</div>
    </div>
  );
};

export default Menu;
