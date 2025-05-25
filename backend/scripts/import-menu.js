const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Papa = require('papaparse');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// 메뉴 스키마 정의
const menuSchema = new mongoose.Schema({
  restaurant_name: String,
  translated_restaurant_name: String,
  menu: String,
  price: String,
  location: String
}, { versionKey: false });

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const parsed = Papa.parse(content, {
    header: true,
    delimiter: ',',
    skipEmptyLines: 'greedy',
    newline: '\n',
    transformHeader: h => h.trim(),
  });
  if (parsed.data.length > 0) {
    console.log('헤더(key) 목록:', Object.keys(parsed.data[0]));
    console.log('첫 번째 row:', parsed.data[0]);
  }
  return parsed.data;
}

async function importMenuToMongoDB() {
  try {
    console.log('MongoDB 연결 시도...');
    const uri = process.env.MONGODB_URI;
    const uriWithoutDbAndParams = uri.split('/').slice(0, 3).join('/');
    const dbUri = `${uriWithoutDbAndParams}/main`;
    const finalUri = dbUri + (uri.includes('?') ? `?${uri.split('?')[1]}` : '?retryWrites=true&w=majority');
    console.log('연결 URI:', finalUri.replace(/\/\/([^:]+):([^@]+)@/, '//********:********@'));
    await mongoose.connect(finalUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB 연결 성공');
    const Menu = mongoose.model('menu', menuSchema, 'menu');
    const menuDir = path.join(__dirname, '../data/menu');
    const csvFiles = fs.readdirSync(menuDir).filter(file => file.endsWith('.csv'));
    await Menu.deleteMany({});
    console.log('기존 데이터를 삭제했습니다.');
    let totalMenus = 0;
    for (const csvFile of csvFiles) {
      const location = csvFile.split('_')[0].toLowerCase();
      const csvPath = path.join(menuDir, csvFile);
      console.log(`\n${csvFile} 파일 처리 중...`);
      const menus = parseCSV(csvPath);
      // 필요한 필드만 추출, price가 비어있으면 저장하지 않음
      const processedMenus = menus
        .filter(menu => menu.price && menu.price.trim() !== '')
        .map(menu => {
          // price에서 숫자만 추출
          const priceMatch = menu.price.replace(/,/g, '').match(/\d+/);
          const priceValue = priceMatch ? parseInt(priceMatch[0], 10) : null;
          return {
            restaurant_name: menu.restaurant_name || '',
            translated_restaurant_name: menu.translated_restaurant_name || '',
            menu: menu.menu || '',
            price: priceValue,
            location
          };
        });
      await Menu.insertMany(processedMenus);
      totalMenus += processedMenus.length;
      console.log(`${csvFile}의 데이터를 성공적으로 저장했습니다.`);
    }
    console.log(`\n총 ${totalMenus}개의 메뉴 데이터를 저장했습니다.`);
    const sampleData = await Menu.findOne();
    console.log('\n저장된 첫 번째 데이터 샘플:');
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
importMenuToMongoDB();
