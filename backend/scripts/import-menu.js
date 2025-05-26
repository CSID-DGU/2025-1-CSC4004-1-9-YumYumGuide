const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Papa = require('papaparse');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const menuSchema = new mongoose.Schema({
  restaurant_name: String,
  translated_restaurant_name: String,
  menu: String,
  price: Number,
  menuAvgPrice: Number,
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
    const Menu = mongoose.model('menu', menuSchema, 'menus');
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

  // price가 유효한 숫자인 경우만 필터링
  const validMenus = menus
    .filter(menu => {
      const priceMatch = menu.price?.replace(/,/g, '').match(/\d+/);
      return priceMatch !== null;
    });

  // restaurant_name 기준으로 그룹화
  const menuMap = new Map();
  for (const menu of validMenus) {
    const name = menu.restaurant_name || '';
    const priceMatch = menu.price.replace(/,/g, '').match(/\d+/);
    const price = priceMatch ? parseInt(priceMatch[0], 10) : null;
    if (!price) continue;

    if (!menuMap.has(name)) {
      menuMap.set(name, []);
    }
    menuMap.get(name).push({ ...menu, price });
  }

  // 평균 가격 계산 및 menuAvgPrice 추가
  const seenKeys = new Set();
  const processedMenus = [];
  
  for (const [name, menus] of menuMap.entries()) {
    const avg = Math.round(menus.reduce((sum, m) => sum + m.price, 0) / menus.length);
    for (const menu of menus) {
      const key = `${menu.restaurant_name}|${menu.menu}|${location}`;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);
  
      processedMenus.push({
        restaurant_name: menu.restaurant_name || '',
        translated_restaurant_name: menu.translated_restaurant_name || '',
        menu: menu.menu || '',
        price: menu.price,
        menuAvgPrice: avg,
        location
      });
    }
  }
  

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
