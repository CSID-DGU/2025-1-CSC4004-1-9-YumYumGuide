const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const mongoose = require('mongoose');

// NestJS 환경에서의 dotenv 설정
const envPath = path.join(__dirname, '../.env');
console.log('환경변수 설정 중...');
console.log(`   .env 파일 경로: ${envPath}`);
console.log(`   .env 파일 존재: ${fs.existsSync(envPath) ? '있음' : '없음'}`);

// dotenv 로딩 (NestJS와 호환)
if (fs.existsSync(envPath)) {
  require('dotenv').config({ 
    path: envPath,
    override: true  // 기존 환경변수 덮어쓰기
  });
  console.log('.env 파일 로딩 완료');
} else {
  console.warn('.env 파일을 찾을 수 없습니다');
}

// Restaurant 모델 임포트
let Restaurant;
try {
  Restaurant = require('../models/Restauarnt'); // 오타 그대로 유지
  console.log('Restaurant 모델 로딩 성공');
} catch (error) {
  console.error('Restaurant 모델 로딩 실패:', error.message);
  console.log('models/Restaurant.js 파일이 존재하는지 확인해주세요');
  process.exit(1);
}

// 환경변수 확인 및 출력
console.log('\n=== 환경변수 상태 ===');
const mongoVars = {
  'MONGODB_URI': process.env.MONGODB_URI,
  'MONGODB_URL': process.env.MONGODB_URL,
  'DATABASE_URL': process.env.DATABASE_URL,
  'MONGO_URI': process.env.MONGO_URI,
  'DB_HOST': process.env.DB_HOST,
  'DB_PORT': process.env.DB_PORT,
  'DB_NAME': process.env.DB_NAME,
};

Object.entries(mongoVars).forEach(([key, value]) => {
  if (value) {
    console.log(`   ${key}: ${value.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
  } else {
    console.log(`   ${key}: undefined`);
  }
});
console.log('====================\n');

/**
 * MongoDB URI 생성 (restaurantDB 사용)
 * @returns {string} MongoDB 연결 URI
 */
function getMongoDBURI() {
  // NestJS에서 자주 사용하는 환경변수명들 시도
  const possibleVars = [
    process.env.MONGODB_URI,
    process.env.MONGODB_URL,
    process.env.DATABASE_URL,
    process.env.MONGO_URI,
    process.env.DB_URI,
    process.env.TYPEORM_URL,  // TypeORM 사용시
  ];
  
  // 개별 변수로 구성
  if (process.env.DB_HOST) {
    const host = process.env.DB_HOST;
    const port = process.env.DB_PORT || '27017';
    const database = process.env.DB_NAME || 'restaurantDB';
    const username = process.env.DB_USERNAME;
    const password = process.env.DB_PASSWORD;
    
    let uri = `mongodb://`;
    if (username && password) {
      uri += `${username}:${password}@`;
    }
    uri += `${host}:${port}/${database}`;
    
    console.log('개별 DB 변수로 URI 구성:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    return uri;
  }
  
  // 완전한 URI 찾기
  for (const uri of possibleVars) {
    if (uri && uri.startsWith('mongodb')) {
      // URI에서 데이터베이스명을 restaurantDB로 변경
      const modifiedUri = uri.replace(/\/[^/?]+(\?|$)/, '/restaurantDB$1');
      console.log('환경변수에서 MongoDB URI 발견 (DB명 수정됨):', modifiedUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
      return modifiedUri;
    }
  }
  
  // 기본값 - restaurantDB 사용
  const defaultURI = 'mongodb://localhost:27017/restaurantDB';
  console.warn('환경변수에서 MongoDB URI를 찾을 수 없어 기본값 사용:', defaultURI);
  console.log('.env 파일에 MONGODB_URI=mongodb://localhost:27017/restaurantDB 를 추가하세요');
  return defaultURI;
}

/**
 * CSV 파일을 파싱하는 함수 (개선된 버전)
 * @param {string} filePath - CSV 파일 경로
 * @returns {Promise<Array>} - 파싱된 데이터 배열
 */
async function parseCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    try {
      console.log(`CSV 파일 파싱 시작: ${path.basename(filePath)}`);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`파일이 존재하지 않습니다: ${filePath}`);
      }
      
      const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
      
      // BOM 제거 및 인코딩 문제 해결
      const contentWithoutBOM = fileContent.replace(/^\uFEFF/, '');
      
      Papa.parse(contentWithoutBOM, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        delimiter: ',',
        transformHeader: (header) => {
          // 헤더 정규화 (공백, 특수문자 처리)
          return header.trim()
            .replace(/\./g, '_')
            .replace(/\$/g, '_')
            .replace(/\s+/g, '_');
        },
        complete: (results) => {
          console.log(`   파싱 결과: ${results.data.length}행`);
          console.log(`   헤더: ${results.meta.fields?.slice(0, 5).join(', ')}...`);
          
          if (results.errors.length > 0) {
            console.warn(`   파싱 경고 ${results.errors.length}개:`, 
              results.errors.slice(0, 3).map(e => e.message));
          }
          
          // 데이터 정제
          const cleanedData = results.data
            .filter((row, index) => {
              // 빈 행 제거
              const hasData = Object.values(row).some(value => 
                value !== null && value !== undefined && String(value).trim() !== ''
              );
              
              if (!hasData) {
                console.log(`   ${index + 1}행: 빈 데이터 제거`);
                return false;
              }
              
              return true;
            })
            .map((row, index) => {
              // 데이터 정규화
              const cleanRow = {};
              Object.keys(row).forEach(key => {
                let value = row[key];
                
                // 빈 문자열을 null로 변환
                if (value === '' || value === undefined) {
                  value = null;
                }
                
                // 키 정규화
                const cleanKey = key.trim()
                  .replace(/\./g, '_')
                  .replace(/\$/g, '_')
                  .replace(/\s+/g, '_');
                
                cleanRow[cleanKey] = value;
              });
              
              return cleanRow;
            })
            .filter((row, index) => {
              // name 필드 검증 (다양한 필드명 확인)
              const nameFields = [
                'restaurant_name', '식당_이름', '식당_이름', 
                'name', 'Name', 'NAME', 'restauarnt_name',
                '식당명', '상호명', 'shop_name'
              ];
              
              const name = nameFields.find(field => row[field] && String(row[field]).trim());
              
              if (!name) {
                console.warn(`   ${index + 1}행: 이름 없음 (사용가능한 키: ${Object.keys(row).slice(0, 5).join(', ')}...)`);
                return false;
              }
              
              // name 필드 통일
              row.name = String(row[name]).trim();
              return true;
            });
          
          console.log(`   정제 완료: ${cleanedData.length}개 유효 데이터`);
          resolve(cleanedData);
        },
        error: (error) => {
          console.error(`   CSV 파싱 오류:`, error);
          reject(error);
        }
      });
    } catch (error) {
      console.error(`파일 읽기 오류:`, error.message);
      reject(error);
    }
  });
}

// 지역명 매핑 (확장됨)
const locationMap = {
  '신주쿠': 'shinjuku',
  '시부야': 'shibuya',
  '하라주쿠': 'harajuku',
  '긴자': 'ginza',
  '롯폰기': 'roppongi',
  '아키하바라': 'akihabara',
  '이케부코로': 'ikebukuro',
  '아사쿠사': 'asakusa',
  '우에노': 'ueno',
  '츠키지': 'tsukiji',
  '구다': 'guda',
  '나카메': 'nakame',
  '메구로': 'meguro',
  '하마마츠': 'hamamatsu',
  '하마 마츠': 'hamamatsu',
  '니혼바시': 'nihonbashi',
  '니혼 바시': 'nihonbashi',
  '에비스': 'ebisu',
  '신바시': 'shimbashi',
  '도쿄': 'tokyo',
  '요코하마': 'yokohama',
};

/**
 * 파일명에서 지역명 추출
 * @param {string} filename - CSV 파일명
 * @returns {string|null} - 영문 지역명
 */
function extractLocationFromFilename(filename) {
  console.log(`지역명 추출 시도: ${filename}`);
  
  // 한글 패턴 매칭 (공백 포함)
  const koreanMatch = filename.match(/^([가-힣]+(\s+[가-힣]+)*)/);
  if (koreanMatch) {
    const korLocation = koreanMatch[0].trim();
    const engLocation = locationMap[korLocation] || korLocation.toLowerCase().replace(/\s+/g, '');
    console.log(`   매핑 결과: ${korLocation} -> ${engLocation}`);
    return engLocation;
  }
  
  // 영문 패턴 매칭
  const englishMatch = filename.match(/^([a-zA-Z]+)/);
  if (englishMatch) {
    const location = englishMatch[0].toLowerCase();
    console.log(`   영문 지역명: ${location}`);
    return location;
  }
  
  console.warn(`   지역명 추출 실패: ${filename}`);
  return null;
}

/**
 * MongoDB 연결 테스트
 */
async function testConnection(uri) {
  try {
    console.log('MongoDB 연결 테스트...');
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000,
    });
    
    console.log('MongoDB 연결 성공!');
    console.log(`   데이터베이스: ${mongoose.connection.db.databaseName}`);
    return true;
  } catch (error) {
    console.error('MongoDB 연결 실패:', error.message);
    return false;
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  try {
    console.log('=== 레스토랑 데이터 임포트 시작 ===');
    
    // MongoDB URI 설정
    const MONGODB_URI = getMongoDBURI();
    
    // 연결 테스트
    const connected = await testConnection(MONGODB_URI);
    if (!connected) {
      throw new Error('MongoDB 연결 실패. 서버가 실행 중인지 확인하세요.');
    }
    
    // CSV 파일 검색
    const csvDir = path.join(__dirname, '../data');
    console.log(`\nCSV 디렉토리: ${csvDir}`);
    
    if (!fs.existsSync(csvDir)) {
      throw new Error(`CSV 디렉토리가 없습니다: ${csvDir}`);
    }
    
    const files = fs.readdirSync(csvDir)
      .filter(f => f.endsWith('.csv'))
      .sort(); // 파일명 정렬
    
    if (files.length === 0) {
      throw new Error('CSV 파일이 없습니다.');
    }
    
    console.log(`발견된 파일 (${files.length}개):`);
    files.forEach((file, i) => console.log(`   ${i + 1}. ${file}`));
    
    // 파일별 처리
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const location = extractLocationFromFilename(file);
      
      if (!location) {
        console.warn(`건너뛰기: ${file} (지역명 추출 실패)`);
        errorCount++;
        continue;
      }
      
      const collectionName = `${location}_restaurants`;
      console.log(`\n[${i + 1}/${files.length}] ${collectionName} 처리 중...`);
      
      try {
        // MongoDB 연결
        await mongoose.connect(MONGODB_URI);
        
        // 동적 모델 생성
        const DynamicRestaurant = mongoose.model(
          collectionName,
          Restaurant.schema,
          collectionName
        );
        
        // CSV 파싱
        const filePath = path.join(csvDir, file);
        let restaurants = await parseCSVFile(filePath);
        
        if (restaurants.length === 0) {
          console.warn(`   유효한 데이터 없음`);
          continue;
        }
        
        // 스키마 매핑
        if (typeof Restaurant.mapCSVToSchema === 'function') {
          restaurants = Restaurant.mapCSVToSchema(restaurants);
          console.log(`   스키마 매핑 완료`);
        }
        
        // 데이터 삽입
        const result = await DynamicRestaurant.insertMany(restaurants, {
          ordered: false,
        });
        
        console.log(`   저장 완료: ${result.length}개`);
        successCount++;
        
      } catch (error) {
        console.error(`   오류: ${error.message}`);
        if (error.code === 11000) {
          console.error('      (중복 데이터 존재)');
        }
        errorCount++;
      } finally {
        if (mongoose.connection.readyState === 1) {
          await mongoose.disconnect();
        }
      }
    }
    
    console.log(`\n=== 완료 ===`);
    console.log(`   성공: ${successCount}개`);
    console.log(`   실패: ${errorCount}개`);
    console.log(`   전체: ${files.length}개`);
    
  } catch (error) {
    console.error('치명적 오류:', error.message);
    process.exit(1);
  }
}

// 스크립트 직접 실행시
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { parseCSVFile, extractLocationFromFilename, main };