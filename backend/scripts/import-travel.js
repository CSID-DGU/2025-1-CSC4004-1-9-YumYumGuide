/**
 * 관광 명소 CSV 파일을 파싱하여 MongoDB에 삽입하는 스크립트
 * 
 * 사용법:
 * 1. .env 파일에 MONGODB_URI 설정
 * 2. CSV 파일을 backend/data 폴더에 저장
 * 3. 아래 명령어로 실행: node import-tourist-spots.js [파일명]
 */

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const mongoose = require('mongoose');
const TouristSpot = require('./models/touristSpot');
require('dotenv').config();

// MongoDB 연결 문자열 확인
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('오류: .env 파일에 MONGODB_URI가 설정되지 않았습니다.');
  process.exit(1);
}

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
 * @param {string} customFilePath - 사용자 지정 파일 경로 (선택적)
 * @returns {string} - 발견된 CSV 파일 경로
 */
function findCSVFile(customFilePath = null) {
  // 사용자가 직접 파일 경로를 지정한 경우
  if (customFilePath && fs.existsSync(customFilePath)) {
    console.log(`지정된 파일을 찾았습니다: ${customFilePath}`);
    return customFilePath;
  }
  
  // 파일명이 명령줄 인수로 제공된 경우
  const cmdLineFilename = process.argv[2];
  if (cmdLineFilename) {
    // 절대 경로인지 확인
    if (path.isAbsolute(cmdLineFilename) && fs.existsSync(cmdLineFilename)) {
      console.log(`명령줄에서 지정된 파일을 찾았습니다: ${cmdLineFilename}`);
      return cmdLineFilename;
    }
    
    // backend/data 폴더 내에 있는지 확인
    const dataFolderPath = path.join(process.cwd(), 'backend', 'data', cmdLineFilename);
    if (fs.existsSync(dataFolderPath)) {
      console.log(`backend/data 폴더에서 파일을 찾았습니다: ${dataFolderPath}`);
      return dataFolderPath;
    }
    
    // 현재 디렉토리에 있는지 확인
    const currentDirPath = path.join(process.cwd(), cmdLineFilename);
    if (fs.existsSync(currentDirPath)) {
      console.log(`현재 디렉토리에서 파일을 찾았습니다: ${currentDirPath}`);
      return currentDirPath;
    }
  }
  
  // 기본 위치에서 CSV 파일 검색
  const possiblePaths = [
    path.join(process.cwd(), 'backend', 'data', 'address.csv'),
    path.join(process.cwd(), 'backend', 'data', 'tourist-spots.csv'),
    path.join(process.cwd(), 'backend', 'data', 'spots.csv'),
    path.join(process.cwd(), 'data', 'address.csv'),
    path.join(process.cwd(), 'data', 'tourist-spots.csv'),
    path.join(process.cwd(), 'data', 'spots.csv'),
    // 추가적인 위치가 필요하면 여기에 추가
  ];
  
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      console.log(`파일을 찾았습니다: ${testPath}`);
      return testPath;
    }
  }
  
  // 파일을 찾지 못한 경우
  throw new Error('CSV 파일을 찾을 수 없습니다. 파일 경로를 직접 지정해주세요.');
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
    const mappedData = TouristSpot.mapCSVToSchema(parsedData);
    
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