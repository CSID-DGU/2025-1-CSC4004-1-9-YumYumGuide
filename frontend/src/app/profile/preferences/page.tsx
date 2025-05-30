'use client';

import PreferenceForm from './components/PreferenceForm'; // 새로 만든 컴포넌트 import
import styles from './preferences.module.css'; // 스타일은 유지 (PreferenceForm 내부에서도 사용)

// 기존 Preferences 페이지 컴포넌트
const PreferencesPage = () => {
  return (
    // PreferenceForm 컴포넌트가 이미 최상위 div를 포함하므로 여기서는 추가 div가 필요 없을 수 있습니다.
    // 하지만, 페이지 레벨의 레이아웃이나 추가 요소가 필요하다면 여기에 배치합니다.
    // 여기서는 PreferenceForm이 전체 내용을 다루므로 직접 렌더링합니다.
    <PreferenceForm />
  );
};

export default PreferencesPage;