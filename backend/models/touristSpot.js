/**
 * 관광 명소(address.csv) 데이터 가져오기 스크립트
 * 
 * 사용법:
 * 1. .env 파일에 MONGODB_URI 설정
 * 2. 스크립트 실행: node import-travel.js
 */

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB 연결 문자열 확인
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('오류: .env 파일에 MONGODB_URI가 설정되지 않았습니다.');
  process.exit(1);
}

/**
 * 관광 명소 스키마 정의
 * address.csv 파일의 4개 컬럼과 매핑됩니다.
 */
const TouristSpotSchema = new mongoose.Schema({
  // 기본 정보
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // 분류/카테고리
  category: {
    type: String,
    trim: true
  },
  
  // 설명
  description: {
    type: String,
    trim: true
  },
  
  // 위치 정보
  address: {
    type: String,
    trim: true
  },
  
  // 시스템 필드
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  // 스키마 옵션
  timestamps: true,
  versionKey: false
});

// 인덱스 추가 - 이름 검색 성능 향상
TouristSpotSchema.index({ name: 'text', description: 'text' });

// 한글-영어 매핑 테이블 (CSV 필드명과 스키마 필드 매핑)
const koreanToEnglishMap = {
  '명소': 'name',
  '카테고리': 'category',
  '설명': 'description',
  '주소': 'address'
};

/**
 * CSV 파일을 파싱하는 함수
 * @param {string} filePath - CSV 파일 경로
 * @returns {Promise<Array>} - 파싱된 데이터 배열
 */
async function parseCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    try {
      console.log(`CSV 파일 읽기 시도: ${filePath}`);
      
      // UTF-8로 파일 읽기 (인코딩 문제 해결)
      const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
      
      // BOM 제거 (UTF-8 파일의 시작 부분에 있을 수 있는 마커)
      const contentWithoutBOM = fileContent.replace(/^\uFEFF/, '');
      
      // CSV 파싱 설정
      Papa.parse(contentWithoutBOM, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => {
          // 헤더 이름 정리 (공백 제거 및 MongoDB 호환성 위한 처리)
          return header.trim().replace(/\./g, '_').replace(/\$/g, '_');
        },
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn('CSV 파싱 경고:', results.errors);
          }
          
          // 데이터 정제
          const cleanedData = results.data.map(row => {
            const cleanRow = {};
            
            // 각 필드 처리
            Object.keys(row).forEach(key => {
              // 빈 문자열을 null로 변환
              const value = row[key] === '' ? null : row[key];
              
              // 필드명 정제
              const cleanKey = key.trim().replace(/\./g, '_').replace(/\$/g, '_');
              
              cleanRow[cleanKey] = value;
            });
            
            return cleanRow;
          });
          
          resolve(cleanedData);
        },
        error: (error) => {
          reject(error);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * CSV 데이터를 스키마에 매핑하는 함수
 * @param {Array} csvData - CSV에서 파싱된 데이터
 * @returns {Array} - 스키마에 매핑된 데이터
 */
function mapCSVToSchema(csvData) {
  // 1. 한글 CSV 데이터를 영어 키로 변환
  const mappedData = csvData.map(item => {
    const result = {};
    
    // 각 필드 매핑
    Object.entries(item).forEach(([koreanKey, value]) => {
      const englishKey = koreanToEnglishMap[koreanKey];
      if (englishKey) {
        result[englishKey] = value;
      }
    });
    
    return result;
  });
  
  return mappedData;
}

/**
 * 관광 명소 데이터를 MongoDB에 삽입하는 함수
 * @param {Array} touristSpots - 관광 명소 데이터 배열
 * @returns {Promise<Object>} - 삽입 결과
 */
async function importTouristSpots(touristSpots) {
  try {
    // MongoDB 연결
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB에 연결되었습니다.');
    
    // 모델 정의
    const TouristSpot = mongoose.model('TouristSpot', TouristSpotSchema);
    
    // 빈 이름을 가진 데이터 필터링
    const validSpots = touristSpots.filter(spot => spot.name);
    
    console.log(`유효한 관광 명소 데이터 수: ${validSpots.length}`);
    
    // 삽입 전 기존 데이터 삭제 여부 (옵션)
    const clearExisting = process.env.CLEAR_EXISTING === 'true';
    if (clearExisting) {
      console.log('기존 데이터 삭제 중...');
      await TouristSpot.deleteMany({});
      console.log('기존 데이터가 삭제되었습니다.');
    }
    
    // 데이터 삽입
    const result = await TouristSpot.insertMany(validSpots, { ordered: false });
    
    console.log(`${result.length}개의 관광 명소 데이터가 성공적으로 가져와졌습니다.`);
    return { success: true, count: result.length };
  } catch (error) {
    console.error('관광 명소 가져오기 오류:', error);
    return { success: false, error: error.message };
  } finally {
    // MongoDB 연결 종료
    await mongoose.disconnect();
    console.log('MongoDB 연결이 종료되었습니다.');
  }
}

/**
 * CSV 파일을 찾는 함수
 * @returns {string} - 발견된 CSV 파일 경로
 */
function findCSVFile() {
  // 기본 위치에서 CSV 파일 검색
  const possiblePaths = [
    path.join(process.cwd(), 'data', 'address.csv'),
    path.join(process.cwd(), 'backend', 'data', 'address.csv'),
    path.join(process.cwd(), '..', 'data', 'address.csv'),
    path.join(__dirname, '..', 'data', 'address.csv'),
    path.join(__dirname, 'data', 'address.csv'),
    path.join(__dirname, '..', '..', 'data', 'address.csv')
  ];
  
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      console.log(`파일을 찾았습니다: ${testPath}`);
      return testPath;
    }
  }
  
  // 파일을 찾지 못한 경우
  throw new Error('address.csv 파일을 찾을 수 없습니다. backend/data 또는 data 폴더에 파일이 있는지 확인하세요.');
}

/**
 * 메인 함수 - 프로그램의 진입점
 */
async function main() {
  try {
    // CSV 파일 경로 찾기
    const csvFilePath = findCSVFile();
    
    // CSV 파싱
    console.log('CSV 파일 파싱 중...');
    const parsedData = await parseCSVFile(csvFilePath);
    
    console.log(`${parsedData.length}개의 데이터 항목이 파싱되었습니다.`);
    
    // 처음 몇 개 항목 출력하여 확인
    console.log('파싱된 데이터 샘플:');
    console.log(JSON.stringify(parsedData.slice(0, 1), null, 2));
    
    // 스키마에 매핑
    console.log('데이터를 스키마에 매핑 중...');
    const mappedData = mapCSVToSchema(parsedData);
    
    console.log(`스키마에 매핑된 데이터 수: ${mappedData.length}`);
    
    // 매핑된 데이터 샘플 출력
    console.log('매핑된 데이터 샘플:');
    console.log(JSON.stringify(mappedData.slice(0, 1), null, 2));
    
    // MongoDB에 삽입
    const result = await importTouristSpots(mappedData);
    
    if (result.success) {
      console.log('✅ 데이터베이스 가져오기 완료!');
      console.log(`총 ${result.count}개의 데이터가 삽입되었습니다.`);
    } else {
      console.error('❌ 데이터베이스 가져오기 실패:');
      console.error(result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('🔥 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
main().then(() => {
  console.log('프로그램이 완료되었습니다.');
});