import React from 'react';
import styles from '../profile.module.css';

interface HeaderProps {
  goBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ goBack }) => {
  return (
    <div className={styles.div1}>프로필</div>
  );
};

export default Header; 