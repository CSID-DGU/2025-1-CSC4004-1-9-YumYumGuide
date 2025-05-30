import React from 'react';
import Image from 'next/image';
import styles from '../profile.module.css';

interface MenuListProps {
  onLogoutClick: () => void;
  onSettingClick: () => void;
  onFavorClick: () => void;
}

const MenuList: React.FC<MenuListProps> = ({
  onLogoutClick,
  onSettingClick,
  onFavorClick,
}) => {
  return (
    <div className={styles.menu}>
      {/* 로그아웃 */}
      <div className={styles.logoutGroup} onClick={onLogoutClick}>
        <div className={styles.logoutGroupChild} />
        <div className={styles.logout}>
          <div className={styles.div2}>로그아웃</div>
          <Image className={styles.logoutIcon} width={17} height={18} alt="" src="/icons/logout.svg" />
          <Image className={styles.arrowIcon} width={6} height={12} alt="" src="/icons/arrow.svg" />
        </div>
      </div>

      {/* 프로필 설정 */}
      <div className={styles.settingGroup} onClick={onSettingClick}>
        <div className={styles.settingGroupChild} />
        <div className={styles.setting}>
          <div className={styles.div3}>프로필 설정</div>
          <Image className={styles.profileIcon2} width={16} height={18} alt="" src="/icons/profile2.svg" />
          <Image className={styles.arrowIcon} width={6} height={12} alt="" src="/icons/arrow.svg" />
        </div>
      </div>

      {/* 취향 설정 */}
      <div className={styles.favorGroup} onClick={onFavorClick}>
        <div className={styles.favorGroupChild} />
        <div className={styles.favor}>
          <div className={styles.div4}>사용자 취향 설정</div>
          <Image className={styles.favoriteIcon} width={24} height={20} alt="" src="/icons/favorite.svg" />
          <Image className={styles.arrowIcon} width={6} height={12} alt="" src="/icons/arrow.svg" />
        </div>
      </div>
    </div>
  );
};

export default MenuList; 