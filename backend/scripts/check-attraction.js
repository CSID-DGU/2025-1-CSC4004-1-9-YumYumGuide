const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const attractionSchema = new mongoose.Schema({
  category: String,
  attraction: String,
  description: String,
  address: String,
  date: { type: String, required: false }
}, { versionKey: false });  // __v 필드 비활성화

async function checkAttractionData() {
  try {
    console.log('MongoDB 연결 시도...');
    const baseUri = process.env.MONGODB_URI.split('?')[0];
    const dbUri = `${baseUri}/attractionDB?retryWrites=true&w=majority&appName=yumyum`;
    console.log('연결 URI:', dbUri);

    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB 연결 성공');

    const Attraction = mongoose.model('attraction', attractionSchema, 'attraction');
    const data = await Attraction.find().limit(1);
    console.log('첫 번째 데이터:', JSON.stringify(data, null, 2));

    // 전체 데이터 수 확인
    const count = await Attraction.countDocuments();
    console.log('전체 데이터 수:', count);

  } catch (error) {
    console.error('에러 발생:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB 연결이 종료되었습니다.');
  }
}

checkAttractionData(); 