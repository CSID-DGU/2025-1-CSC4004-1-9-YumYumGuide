'use client';

import React from "react";
import styles from "./dayCard.module.css";

interface DayCardProps {
  day: number;
  selected?: boolean;
  onClick?: () => void;
  totalDays: number;
}

const DayCard: React.FC<DayCardProps> = ({ day, selected = false, onClick, totalDays }) => {
  const getWidthClass = () => {
    if (totalDays <= 3) {
      switch (totalDays) {
        case 1:
          return styles.oneDay;
        case 2:
          return styles.twoDays;
        case 3:
          return styles.threeDays;
        default:
          return '';
      }
    }
    return '';
  };

  const cardClassName = totalDays <= 3 
    ? `${styles.card} ${styles.fullWidth} ${getWidthClass()}`
    : styles.card;

  return (
    <div className={cardClassName} onClick={onClick}>
      <div className={`${styles.box} ${selected ? styles.selected : ''}`}>
        <div className={styles.dayText}>{day}일차</div>
      </div>
    </div>
  );
};

export default DayCard;