// frontend/src/app/import-restauarnts.js
import { useState } from 'react';
import Papa from 'papaparse';
import axios from 'axios';

// CSV 데이터를 MongoDB 형식으로 변환하는 함수
const transformRestaurantData = (record) => {
  // 장르 변환
  let genre = '기타';
  if (record['장르']) {
    const genreText = record['장르'];
    if (genreText.includes('고기') || genreText.includes('육')) {
      genre = '육';
    } else if (genreText.includes('회') || genreText.includes('해산물') || genreText.includes('해')) {
      genre = '해';
    } else if (genreText.includes('디저트') || genreText.includes('케이크') || genreText.includes('빵')) {
      genre = '디저트';
    } else if (genreText.includes('면') || genreText.includes('파스타') || genreText.includes('라멘')) {
      genre = '면';
    } else if (genreText.includes('밥') || genreText.includes('쌀') || genreText.includes('덮밥')) {
      genre = '밥';
    } else if (genreText.includes('술') || genreText.includes('바') || genreText.includes('이자카야')) {
      genre = '술';
    }
  }
  
  // 예산 데이터 추출
  const budgetText = record['예산'] || '';
  const lunchMatch = budgetText.match(/점심[:\s]*([0-9,]+)/);
  const dinnerMatch = budgetText.match(/저녁[:\s]*([0-9,]+)/);
  
  const budget = {
    lunch: lunchMatch ? parseInt(lunchMatch[1].replace(/,/g, '')) : null,
    dinner: dinnerMatch ? parseInt(dinnerMatch[1].replace(/,/g, '')) : null
  };
  
  // 좌석 수 추출
  const seatsText = record['좌석'] || '';
  const seatsMatch = seatsText.match(/(\d+)/);
  const seats = seatsMatch ? parseInt(seatsMatch[1]) : null;
  
  // 불리언 값 변환
  const booleanConverter = (value) => {
    if (!value) return false;
    return value.includes('예') || value.includes('가능') || value.includes('있음');
  };
  
  // 드레스 코드 변환
  let dressCode = '없음';
  if (record['드레스 코드']) {
    const dressCodeText = record['드레스 코드'];
    if (dressCodeText.includes('정장') || dressCodeText.includes('포멀')) {
      dressCode = '정장';
    } else if (dressCodeText.includes('캐주얼') || dressCodeText.includes('편안')) {
      dressCode = '캐주얼';
    }
  }
  
  // 요리 특징 조건 추출
  const cuisineFeatures = [];
  if (record['요리 기능과 전문 분야']) {
    const features = record['요리 기능과 전문 분야'].split(',');
    features.forEach(feature => {
      const trimmedFeature = feature.trim();
      if (trimmedFeature) {
        cuisineFeatures.push(trimmedFeature);
      }
    });
  }
  
  // 음료 특징 조건 추출
  const drinkFeatures = [];
  if (record['마시는 기능과 세부 사항에 대한 관심']) {
    const features = record['마시는 기능과 세부 사항에 대한 관심'].split(',');
    features.forEach(feature => {
      const trimmedFeature = feature.trim();
      if (trimmedFeature) {
        drinkFeatures.push(trimmedFeature);
      }
    });
  }

  return {
    name: record['식당 이름'] || '',
    translatedName: record['번역된 식당 이름'] || '',
    genre: genre,
    businessHours: record['영업 시간'] || '',
    regularHoliday: record['닫힌 날'] || '',
    budget: budget,
    address: record['주소'] || '',
    seats: seats,
    counterSeats: booleanConverter(record['카운터 좌석']),
    smoking: booleanConverter(record['흡연']),
    privateRoom: booleanConverter(record['개인 실']),
    dressCode: dressCode,
    cuisineFeatures: cuisineFeatures,
    wifi: booleanConverter(record['Wi-Fi 사용']),
    unlimitedDrinks: booleanConverter(record['당신이 마실 수있는 모든 것']),
    drinkFeatures: drinkFeatures,
    unlimitedFood: false, // CSV에 해당 필드가 없어 기본값 사용
    creditCard: booleanConverter(record['신용 카드']),
    // 사진 및 메뉴 정보는 CSV에 없으므로 빈 객체/배열 사용
    photos: {
      menuPhotos: [],
      chefPhoto: null,
      interiorPhoto: null
    },
    menus: [],
    recommendedMenus: []
  };
};

export default function ImportRestaurants() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('파일을 선택해주세요');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // CSV 파일 파싱
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: 'utf-8',
        complete: async (results) => {
          try {
            // 데이터 변환
            const transformedData = results.data.map(transformRestaurantData);
            
            // API 호출하여 MongoDB에 저장
            const response = await axios.post('/api/restaurants/import', { 
              restaurants: transformedData 
            });
            
            setResult({
              total: transformedData.length,
              inserted: response.data.insertedCount
            });
          } catch (err) {
            console.error('데이터 변환 및 저장 오류:', err);
            setError('데이터 변환 및 저장 중 오류가 발생했습니다: ' + err.message);
          } finally {
            setLoading(false);
          }
        },
        error: (err) => {
          console.error('CSV 파싱 오류:', err);
          setError('CSV 파싱 중 오류가 발생했습니다: ' + err.message);
          setLoading(false);
        }
      });
    } catch (err) {
      console.error('파일 처리 오류:', err);
      setError('파일 처리 중 오류가 발생했습니다: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">레스토랑 데이터 가져오기</h1>
      
      <div className="mb-4">
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange}
          className="mb-2"
        />
        <button 
          onClick={handleImport}
          disabled={loading || !file}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {loading ? '처리 중...' : '가져오기'}
        </button>
      </div>
      
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded mb-4">
          {error}
        </div>
      )}
      
      {result && (
        <div className="p-4 bg-green-100 text-green-700 rounded">
          <p>데이터 가져오기 완료!</p>
          <p>총 {result.total}개의 레스토랑 중 {result.inserted}개가 성공적으로 저장되었습니다.</p>
        </div>
      )}
    </div>
  );
}