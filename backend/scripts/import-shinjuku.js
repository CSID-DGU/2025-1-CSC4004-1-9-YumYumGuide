const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const mongoose = require('mongoose');
const RestaurantSchema = require('../models/Restauarnt').schema;
require('dotenv').config({ path: path.join(__dirname, '../.env') });

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

// 드레스코드 매핑 함수
function mapDressCode(dressCodeStr) {
  if (!dressCodeStr) return '없음';
  
  const lowerDressCode = dressCodeStr.toLowerCase();
  if (lowerDressCode.includes('정장') || lowerDressCode.includes('formal')) return '정장';
  if (lowerDressCode.includes('캐주얼') || lowerDressCode.includes('casual') || 
      lowerDressCode.includes('평상복')) return '캐주얼';
  return '없음';
}

async function importShinjukuCSV() {
  try {
    // MongoDB 연결
    console.log('MongoDB 연결 시도...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB에 연결되었습니다.');

    // CSV 파일 읽기
    const csvFilePath = path.join(__dirname, '../data/신주쿠_restaurant_details_preprocessed_eng_preprocessed_1502.csv');
    console.log('CSV 파일 경로:', csvFilePath);
    
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    const { data, errors } = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
    
    if (errors.length > 0) {
      console.error('CSV 파싱 에러:', errors);
      return;
    }

    console.log('CSV 헤더:', Object.keys(data[0]));
    console.log('첫 번째 데이터:', data[0]);

    // 데이터 매핑 및 저장
    const restaurants = data.map(row => ({
      name: row.translated_restaurant_name || row.restaurant_name,
      originalName: row.restaurant_name,
      url: row.url,
      phone: row.phone_number || row.tel,
      cuisine: row.genre,
      businessHours: row.business_hours,
      closedDays: row.closed_days,
      ...parseBudget(row.budget),
      creditCard: row.credit_card === '예',
      qrPayment: row.qr_code_payment === '예',
      address: row.address,
      entrance: row.entrance,
      parking: row.parking === '예',
      seats: parseInt(row.seats) || 0,
      counterSeats: row.counter_seats === '예',
      privateRoom: row.private_room === '예',
      private: row.private === '예',
      website: row.store_website,
      remarks: row.remarks,
      lecture: row.lecture === '예',
      cookingSpecialties: row.cooking_specialties,
      drinkingSpecialties: row.drinking_specialties,
      reservation: row.reservation === '예',
      usageScenes: row.usage_scenes,
      waiting: row.waiting === '예',
      service: row.service,
      childFriendly: row.child_friendly === '예',
      petFriendly: row.pet_friendly === '예',
      powerSupply: row.power_supply_available === '예',
      wifi: row.wifi_available === '예',
      foreignLanguageSupport: row.foreign_language_support === '예',
      video: row.video,
      icCardPayment: !!(row.ic_card_payment && row.ic_card_payment.trim() !== ''),
      smoking: row.smoking === '예',
      instagram: row.instagram,
      facebook: row.facebook,
      availableDrinks: row.available_drinks,
      dressCode: mapDressCode(row.dress_code),
      twitter: row.twitter,
      additionalEquipment: row.additional_equipment,
      onlineReservation: row['온라인 예약'] === '예',
      shoppingInfo: row['쇼핑 직무 정보'],
      beerMaker: row.beer_maker,
      nearbyFacilities: row['인근 시설']
    }));

    // 데이터 저장
    console.log('데이터 저장 시도...');
    const region = '신주쿠';
    const Restaurant = mongoose.model(region, RestaurantSchema, region);
    const result = await Restaurant.insertMany(restaurants);
    console.log(`${region} 지역: ${result.length}개 레코드 저장 완료`);

  } catch (error) {
    console.error('에러 발생:', error);
  } finally {
    // MongoDB 연결 종료
    await mongoose.connection.close();
    console.log('MongoDB 연결이 종료되었습니다.');
  }
}

importShinjukuCSV(); 