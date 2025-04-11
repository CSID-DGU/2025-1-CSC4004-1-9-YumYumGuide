// test-mongodb-connection.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' }); // .env.local 파일에서 환경변수 로드

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MongoDB URI가 없습니다. .env.local 파일에 MONGODB_URI를 설정해 주세요.');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('MongoDB에 연결 시도 중...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB 연결 성공!');
    
    // 연결 테스트를 위한 간단한 스키마 생성
    const testSchema = new mongoose.Schema({
      name: String,
      date: { type: Date, default: Date.now }
    });
    
    // 임시 모델 생성
    const Test = mongoose.models.Test || mongoose.model('Test', testSchema);
    
    // 테스트 문서 생성
    const testDoc = new Test({ name: '연결 테스트' });
    await testDoc.save();
    console.log('테스트 문서가 성공적으로 저장되었습니다:', testDoc);
    
    // 저장된 문서 불러오기
    const result = await Test.findOne({ name: '연결 테스트' });
    console.log('저장된 문서 확인:', result);
    
    // 테스트 문서 삭제 (선택사항)
    await Test.deleteOne({ _id: testDoc._id });
    console.log('테스트 문서가 삭제되었습니다.');
    
    // 연결 종료
    await mongoose.connection.close();
    console.log('MongoDB 연결이 종료되었습니다.');
    
  } catch (error) {
    console.error('MongoDB 연결 테스트 중 오류 발생:', error);
  }
}

testConnection();