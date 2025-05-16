'use client';

import React from "react";
import styles from "./dayCard.module.css";

interface DayCardProps {
  day: number;
  selected?: boolean;
  onClick?: () => void;
}

const DayCard: React.FC<DayCardProps> = ({ day, selected = false, onClick }) => {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={`${styles.box} ${selected ? styles.selected : ''}`}>
        <div className={styles.dayText}>{day}일차</div>
      </div>
    </div>
  );
};

export default DayCard;