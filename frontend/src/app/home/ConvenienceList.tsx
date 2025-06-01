'use client';
import React, { useEffect, useState } from 'react';
import Menu, { MenuItem } from './components/Menu'; // Menu 컴포넌트와 타입 import
import styles from './convenience.module.css'; // ConvenienceList 자체 스타일
// import menuListStyles from './components/Menu.module.css'; // Menu 컴포넌트 리스트 컨테이너 스타일용 (필요시)

interface ConvenienceListProps {
  storeType: 'familymart' | 'seveneleven' | 'lawson' | string; // string으로 확장하여 다른 편의점도 가능하도록
  onClose: () => void; // 닫기 함수를 props로 받음
}

const ConvenienceList: React.FC<ConvenienceListProps> = ({ storeType, onClose }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConvenienceData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 실제 API 엔드포인트는 백엔드 구현에 따라 정확히 명시해야 합니다.
        // GET /api/convenience?type=FamilyMart&limit=30 와 같은 형태를 가정합니다.
        // 또는 /api/convenience/FamilyMart?limit=30 등
        // 여기서는 사용자가 제공한 backend/src/convenience/convenience.controller.ts 를 참고하여
        // GET /api/convenience/:type?limit=30 와 유사한 엔드포인트를 가정합니다.
        // 위 가정이 변경되었으므로 아래 URL을 수정합니다.
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/convenience?storeType=${storeType}&take=30`,
        );
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`데이터를 불러오는 데 실패했습니다: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        // 백엔드 응답 데이터 구조를 MenuItem[]에 맞게 매핑해야 할 수 있습니다.
        // 예를 들어, 백엔드 필드명이 name_kr 이라면 data.map(d => ({ ...d, nameKr: d.name_kr })) 형태로 변환
        // 현재는 백엔드 응답이 MenuItem[]과 호환된다고 가정합니다.
        // 위 가정이 틀렸음. ApiResponseDto -> PaginationResponseDto -> items 형태로 중첩되어 있음.
        if (data && data.success && data.data && Array.isArray(data.data.items)) {
          setMenuItems(data.data.items as MenuItem[]);
        } else if (data && !data.success && data.message) {
          // 백엔드에서 success: false로 응답하고 message가 있는 경우 (예: 커스텀 에러)
          throw new Error(data.message);
        } else {
          // 예상치 못한 응답 구조
          throw new Error('백엔드로부터 예상치 못한 응답을 받았습니다.');
        }
      } catch (err) {
        console.error('Error fetching convenience data:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류 발생');
      } finally {
        setIsLoading(false);
      }
    };

    if (storeType) {
      fetchConvenienceData();
    }
  }, [storeType]);

  // 로딩, 에러, 빈 상태 UI는 listContent 내부에 표시되도록 구성
  let content;
  if (isLoading) {
    content = <div className={styles.loadingContainer}>로딩 중...</div>;
  } else if (error) {
    content = (
      <div className={styles.errorContainer}>
        오류: {error}
        <button onClick={onClose} className={styles.closeButtonSmall} style={{ marginTop: '10px' }}>
          닫기
        </button>
      </div>
    );
  } else if (!menuItems.length) {
    content = (
      <div className={styles.emptyContainer}>
        해당 편의점의 상품 정보가 없습니다.
        <button onClick={onClose} className={styles.closeButtonSmall} style={{ marginTop: '10px' }}>
          닫기
        </button>
      </div>
    );
  } else {
    content = (
      <div className={styles.menuListContainer}>
        {menuItems.map((item) => (
          // Menu 컴포넌트의 key는 고유해야 합니다. item.id를 사용합니다.
          <Menu key={item.id} item={item} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.overlayContainer} onClick={onClose}>
      {' '}
      {/* 배경 클릭 시 닫기 */}
      <div className={styles.listContent} onClick={(e) => e.stopPropagation()}>
        {' '}
        {/* 컨텐츠 클릭은 전파 방지 */}
        <div className={styles.listHeader}>
          <h2>
            {storeType === 'familymart'
              ? '훼미리 마트 신상품'
              : storeType === 'seveneleven'
              ? '세븐일레븐 신상품'
              : storeType === 'lawson'
              ? '로손 신상품'
              : `${storeType} 신상품`}
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            X
          </button>
        </div>
        {content}
      </div>
    </div>
  );
};

export default ConvenienceList;
