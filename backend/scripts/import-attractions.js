const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// 관광지 스키마 정의
const attractionSchema = new mongoose.Schema({
  category: String,
  attraction: String,
  description: String,
  address: String,
  image: String,
  date: String,
  price: String
}, { versionKey: false });

// CSV 파일을 읽고 파싱하는 함수
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  
  return lines.slice(1).map(line => {
    const values = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());
    
    const obj = {};
    headers.forEach((header, index) => {
      let value = values[index] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      obj[header] = value;
    });
    return obj;
  });
}

async function importAttractionsToMongoDB() {
  try {
    console.log('MongoDB 연결 시도...');
    const uri = process.env.MONGODB_URI;
    const uriWithoutDbAndParams = uri.split('/').slice(0, 3).join('/');
    const dbUri = `${uriWithoutDbAndParams}/main`;
    
    const finalUri = dbUri + (uri.includes('?') ? 
      `?${uri.split('?')[1]}` : 
      '?retryWrites=true&w=majority');
    
    console.log('연결 URI:', finalUri.replace(/\/\/([^:]+):([^@]+)@/, '//********:********@'));

    await mongoose.connect(finalUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB 연결 성공');

    // Attraction 모델 생성 (main DB의 attractions 컬렉션 사용)
    const Attraction = mongoose.model('attraction', attractionSchema, 'attractions');

    // CSV 파일 읽기
    const csvPath = path.join(__dirname, '../data/attractions.csv');
    console.log('CSV 파일 읽기:', csvPath);
    
    const attractions = parseCSV(csvPath);
    console.log(`총 ${attractions.length}개의 관광지 데이터를 읽었습니다.`);

    // 기존 데이터 삭제
    await Attraction.deleteMany({});
    console.log('기존 데이터를 삭제했습니다.');

    // 새 데이터 삽입
    await Attraction.insertMany(attractions);
    console.log('새로운 데이터를 성공적으로 저장했습니다.');

    // 샘플 데이터 출력
    const sampleData = await Attraction.findOne();
    console.log('\n첫 번째 데이터 샘플:');
    console.log(sampleData);

  } catch (error) {
    console.error('에러 발생:', error);
    console.error('에러 스택:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB 연결이 종료되었습니다.');
  }
}

// 스크립트 실행
importAttractionsToMongoDB();