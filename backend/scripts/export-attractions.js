const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// 관광지 스키마 정의 (실제 DB 구조에 맞게)
const attractionSchema = new mongoose.Schema({
  category: String,
  attraction: String,
  description: String,
  address: String
}, { versionKey: false });

// CSV 헤더 생성
const fields = [
  'category',
  'attraction',
  'description',
  'address'
];

// 객체를 CSV 행으로 변환하는 함수
function objectToCSVRow(obj) {
  return fields.map(field => {
    const value = obj[field];
    // 값이 문자열이고 쉼표나 줄바꿈이 포함된 경우 따옴표로 감싸기
    if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value === null || value === undefined ? '' : value;
  }).join(',');
}

async function exportAttractionsToCSV() {
  try {
    console.log('MongoDB 연결 시도...');
    const uri = process.env.MONGODB_URI;
    const uriWithoutDbAndParams = uri.split('/').slice(0, 3).join('/');
    const dbUri = `${uriWithoutDbAndParams}/attractionDB`;
    
    const finalUri = dbUri + (uri.includes('?') ? 
      `?${uri.split('?')[1]}` : 
      '?retryWrites=true&w=majority');
    
    console.log('연결 URI:', finalUri.replace(/\/\/([^:]+):([^@]+)@/, '//********:********@'));

    await mongoose.connect(finalUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB 연결 성공');

    // Attraction 모델 생성 (attractionDB의 attraction 컬렉션 사용)
    const Attraction = mongoose.model('attraction', attractionSchema, 'attraction');

    // 모든 관광지 데이터 가져오기
    const attractions = await Attraction.find({});
    console.log(`총 ${attractions.length}개의 관광지 데이터를 가져왔습니다.`);

    if (attractions.length === 0) {
      console.log('데이터베이스의 컬렉션 목록을 확인합니다...');
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('사용 가능한 컬렉션:', collections.map(c => c.name));
      throw new Error('관광지 데이터를 찾을 수 없습니다.');
    }

    // CSV 파일 생성
    const csvRows = [
      fields.join(','), // 헤더 행
      ...attractions.map(attraction => objectToCSVRow(attraction)) // 데이터 행
    ];

    const csvContent = csvRows.join('\n');

    // CSV 파일 저장
    const outputPath = path.join(__dirname, '../data/attractions_export.csv');
    fs.writeFileSync(outputPath, csvContent);
    console.log(`CSV 파일이 저장되었습니다: ${outputPath}`);

    // 샘플 데이터 출력
    console.log('\n첫 번째 데이터 샘플:');
    console.log(attractions[0]);

  } catch (error) {
    console.error('에러 발생:', error);
    console.error('에러 스택:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB 연결이 종료되었습니다.');
  }
}

// 스크립트 실행
exportAttractionsToCSV(); 