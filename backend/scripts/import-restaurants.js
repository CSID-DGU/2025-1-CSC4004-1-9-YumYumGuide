const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const mongoose = require('mongoose');
const Restaurant = require('../models/Restauarnt');
require('dotenv').config();

/**
 * CSV 파일을 파싱하는 함수
 * 
 * @param {string} filePath - CSV 파일 경로
 * @returns {Promise<Array>} - 파싱된 데이터 배열
 */
async function parseCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    try {
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
 * 레스토랑 데이터를 MongoDB에 삽입하는 함수
 * 
 * @param {Array} restaurants - 레스토랑 데이터 배열
 * @returns {Promise<Object>} - 삽입 결과
 */
async function importRestaurants(restaurants) {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB에 연결되었습니다.');
    
    // 필드 매핑 및 데이터 변환
    const mappedRestaurants = restaurants.map(restaurant => {
      // 식당 이름 필드 처리 (이름 인식 문제 해결)
      let restaurantName = restaurant['식당_이름'] || restaurant['식당 이름'] || restaurant['しゃぶ禅_渋谷店'];
      // 백업 필드 - 번역된 이름이나 다른 필드에서 이름을 찾음
      if (!restaurantName) {
        restaurantName = restaurant['번역된_식당_이름'] || restaurant['번역된 식당 이름'] || restaurant['Shabu_Zen_Shibuya_상점'];
      }
      
      // MongoDB 문서 생성
      return {
        name: restaurantName,
        translatedName: restaurant['번역된_식당_이름'] || restaurant['번역된 식당 이름'] || null,
        tel: restaurant['텔'] || restaurant['電話番号'] || null,
        genre: restaurant['장르'] || restaurant['ジャンル'] || null,
        businessHours: restaurant['영업_시간'] || restaurant['영업 시간'] || null,
        closedDays: restaurant['닫힌_날'] || restaurant['닫힌 날'] || null,
        budget: restaurant['예산'] || null,
        address: restaurant['주소'] || null,
        // 기타 필드들...
        createdAt: new Date()
      };
    });
    
    // 빈 이름을 가진 레스토랑 필터링
    const validRestaurants = mappedRestaurants.filter(r => r.name);
    
    // 기존 데이터 삭제 (선택적)
    // await Restaurant.deleteMany({});
    
    // 데이터 삽입
    const result = await Restaurant.insertMany(validRestaurants);
    
    console.log(`${result.length}개의 레스토랑 데이터가 성공적으로 가져와졌습니다.`);
    return { success: true, count: result.length };
  } catch (error) {
    console.error('레스토랑 가져오기 오류:', error);
    return { success: false, error: error.message };
  } finally {
    // MongoDB 연결 종료
    await mongoose.disconnect();
    console.log('MongoDB 연결이 종료되었습니다.');
  }
}
async function main() {
    try {
      // CSV 파일 경로
      // 여러 가능한 경로를 시도
      let csvFilePath = '';
      const possiblePaths = [
        path.join(__dirname, '../data/restaurants.csv'),
        path.join(__dirname, '../data/paste.txt'),
        path.join(process.cwd(), 'data/restaurants.csv'),
        path.join(process.cwd(), 'data/paste.txt')
      ];
      
      // 존재하는 첫 번째 파일 경로 사용
      for (const testPath of possiblePaths) {
        if (fs.existsSync(testPath)) {
          csvFilePath = testPath;
          console.log(`파일을 찾았습니다: ${csvFilePath}`);
          break;
        }
      }
      
      // 파일이 없으면 사용자에게 메시지 표시
      if (!csvFilePath) {
        console.error('CSV 파일을 찾을 수 없습니다. 다음 경로를 시도했습니다:');
        possiblePaths.forEach(p => console.error(`- ${p}`));
        throw new Error('CSV 파일을 찾을 수 없습니다. 올바른 위치에 파일을 배치하세요.');
      } // 여기에 닫는 괄호 추가
      
      // CSV 파싱
      console.log('CSV 파일 파싱 중...');
      const restaurants = await parseCSVFile(csvFilePath);
      
      console.log(`${restaurants.length}개의 레스토랑 데이터가 파싱되었습니다.`);
      
      // 처음 몇 개 항목 출력하여 확인
      console.log('파싱된 데이터 샘플:');
      console.log(JSON.stringify(restaurants.slice(0, 2), null, 2));
      
      // MongoDB에 삽입
      const result = await importRestaurants(restaurants);
      
      if (result.success) {
        console.log('가져오기 완료!');
      } else {
        console.error('가져오기 실패:', result.error);
        process.exit(1);
      }
    } catch (error) {
      console.error('오류 발생:', error);
      process.exit(1);
    } finally {
      // 종료 시 MongoDB 연결 종료
      await mongoose.disconnect();
      console.log('MongoDB 연결이 종료되었습니다.');
    }
  }
  
  // 스크립트 실행
  main();