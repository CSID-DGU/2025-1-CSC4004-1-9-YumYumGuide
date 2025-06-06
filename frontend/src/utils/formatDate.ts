
// 오늘과 내일 날짜 구하기 (string)
export default function formatDate(dateObj: Date) {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}