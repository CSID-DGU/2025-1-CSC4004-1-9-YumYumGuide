const mongoose = require('mongoose');
const RestaurantSchema = require('../models/Restauarnt').schema;
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// 예산 문자열에서 숫자만 추출하는 함수
function parseBudget(budgetStr) {
  if (!budgetStr) return { lunchBudget: null, dinnerBudget: null };
  
  const lunchMatch = budgetStr.match(/점심\s*:\s*~?\s*([0-9,]+)/);
  const dinnerMatch = budgetStr.match(/저녁\s*식사\s*:\s*~?\s*([0-9,]+)/);
  
  return {
    lunchBudget: lunchMatch ? parseInt(lunchMatch[1].replace(/,/g, '')) : null,
    dinnerBudget: dinnerMatch ? parseInt(dinnerMatch[1].replace(/,/g, '')) : null
  };
}

// 장르(음식 종류) 파싱 함수
function parseGenre(genreStr) {
  if (!genreStr) return [];
  return genreStr.split(' ').filter(g => g.trim() !== '');
}

// 흡연 여부 파싱 함수
function parseSmoking(smokingStr) {
  if (!smokingStr) return false;
  return !smokingStr.includes('불가능');
}

async function createCollection() {
  try {
    const mongoUri = process.env.MONGODB_URI.replace('?', '/restaurantDB?');
    console.log('MongoDB 연결 시도...');
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB 연결 성공');
    
    // 테스트 데이터 생성
    const testData = {
      name: '게 잔 마이 신주쿠 지점',
      originalName: 'かにざんまい 新宿店',
      url: 'https://retty.me/area/PRE13/ARE1/SUB112/100001759394/',
      genre: '게 요리 해산물과 해산물 이자카야 스시',
      ...parseBudget('점심 : ~ 2,000 엔\n저녁 식사 : ~ 6,000 엔'),
      smoking: parseSmoking('불가능합니다'),
      seats: 70,
      counterSeats: false,
      privateRoom: false,
      private: false,
      dressCode: '없음',
      wifi: true,
      creditCard: true,
      qrPayment: false,
      icCardPayment: true,
      childrenAllowed: true,
      petsAllowed: false,
      powerOutlets: false,
      photos: { menuPhotos: [] },
      menus: [],
      recommendedMenus: []
    };

    const Restaurant = mongoose.model('shinjuku', RestaurantSchema, 'shinjuku');
    const result = await Restaurant.create(testData);
    console.log('저장된 데이터:', JSON.stringify(result, null, 2));

    await mongoose.connection.close();
    console.log('신주쿠 컬렉션 생성 및 테스트 데이터 저장 완료');
  } catch (error) {
    console.error('에러 발생:', error);
  }
}

createCollection(); 