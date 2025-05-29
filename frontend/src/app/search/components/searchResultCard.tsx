import styles from "./searchResultCard.module.css";
import Link from "next/link";

interface SearchResultCardProps {
    title: string;
    description: string;
    type: string;
    price: string;
    recommended: boolean;
    onDetailClick: string;
}

const SearchResultCard = ({
  title,
  description,
  type,
  price,
  recommended,
  onDetailClick,
}: SearchResultCardProps) => (
  <div className={`${styles.card} ${recommended ? styles.recommended : ""}`}>
    <div className={styles.cardContent}>
      <div className={styles.headerRow}>
        <span className={styles.title}>{title}</span>
        {recommended && <span className={styles.badge}>추천</span>}
      </div>
      {type && price && (
        <div className={styles.subInfo}>{type} | {price}</div>
      )}
      <Link href={`/detail/${onDetailClick}`} className={styles.detailBtn}>
        상세보기 &gt;
      </Link>
    </div>
    <div className={styles.plusCircle}>
      <span>+</span>
    </div>
  </div>
);

export default SearchResultCard