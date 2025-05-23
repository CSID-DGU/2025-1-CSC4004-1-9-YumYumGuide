const fs = require('fs');
const path = require('path');
const papaparse = require('papaparse');
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// Attraction 스키마 정의 - 버전 관리 비활성화
const attractionSchema = new mongoose.Schema({
  category: String,
  attraction: String,
  description: String,
  address: String,
  date: { type: String, required: false }
}, { versionKey: false });  // __v 필드 비활성화

async function importAttractionsCSV() {
  try {
    console.log('MongoDB 연결 시도...');
    // MongoDB URI 구성 방식 수정
    const uri = process.env.MONGODB_URI;
    // URI에서 데이터베이스 부분 교체
    const uriParts = uri.split('/');
    // 마지막 슬래시(/) 이후의 부분(기존 데이터베이스 이름과 파라미터)을 처리
    const lastPart = uriParts[uriParts.length - 1];
    const hasParams = lastPart.includes('?');
    
    let dbUri;
    if (hasParams) {
      // 파라미터가 있는 경우 기존 데이터베이스 이름만 교체
      const dbAndParams = lastPart.split('?');
      dbUri = uri.replace(lastPart, `attractionDB?${dbAndParams[1]}`);
    } else {
      // 파라미터가 없는 경우 단순히 데이터베이스 이름만 교체
      dbUri = uri.replace(lastPart, 'attractionDB');
    }
    
    console.log('연결 URI:', dbUri);

    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB 연결 성공');

    const csvPath = path.join(__dirname, '../data/tokyo_cards_with_address.csv');
    console.log('CSV 파일 경로:', csvPath);

    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const { data } = papaparse.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: header => {
        const headerMap = {
          '카테고리': 'category',
          '명소': 'attraction',
          '설명_1': 'description',
          '주소': 'address',
          '날짜': 'date'
        };
        return headerMap[header] || header;
      }
    });

    console.log('첫 번째 데이터:', data[0]);

    // 기존 컬렉션 삭제 후 새로 생성
    const Attraction = mongoose.model('attraction', attractionSchema, 'attraction');
    await Attraction.deleteMany({});  // 기존 데이터 삭제

    const mappedData = data.map(item => ({
      category: item.category,
      attraction: item.attraction,
      description: item.description,
      address: item.address,
      date: item.date || undefined
    }));

    await Attraction.insertMany(mappedData);
    console.log(`${mappedData.length}개의 레코드가 저장되었습니다.`);

  } catch (error) {
    console.error('에러 발생:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB 연결이 종료되었습니다.');
  }
}

importAttractionsCSV();