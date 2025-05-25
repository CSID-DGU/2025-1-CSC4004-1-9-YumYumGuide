const fs = require('fs');
const path = require('path');
const papaparse = require('papaparse');
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// 편의점 상품 스키마 정의
const convenienceProductSchema = new mongoose.Schema({
  name: String,
  translatedName: String,
  price: Number,  // 세금 포함 가격으로 통합
  imageUrl: String,
  category: String
}, { versionKey: false });

async function importConvenienceCSV() {
  try {
    console.log('MongoDB 연결 시도...');
    const uri = process.env.MONGODB_URI;
    
    // URI가 이미 완전한 형태인지 확인하고 그대로 사용
    console.log('연결 URI:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//********:********@'));
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB 연결 성공');
    
    const db = mongoose.connection.db;
    console.log('현재 연결된 데이터베이스:', db.databaseName);

    // 여기서 컬렉션 이름을 'conveniences'로 변경
    const ConvenienceProduct = mongoose.model('conveniences', convenienceProductSchema, 'conveniences');
    
    // 여기에 빠진 변수 정의 추가
    const stores = ['family_mart', 'lawson', 'seven_eleven'];
    const csvFiles = {
      family_mart: path.join(__dirname, '../data/family_mart_new_products.csv'),
      lawson: path.join(__dirname, '../data/lawson_new_products.csv'),
      seven_eleven: path.join(__dirname, '../data/seven_eleven_new_products.csv')
    };
    
    const categoryNames = {
      family_mart: 'familymart',
      lawson: 'lawson',
      seven_eleven: 'seveneleven'
    };
    
    // 나머지 코드...
    await ConvenienceProduct.deleteMany({});
    console.log('convenience 컬렉션의 기존 데이터가 삭제되었습니다.');

    for (const store of stores) {
      console.log(`\n${store} 데이터 처리 중...`);
      const csvPath = csvFiles[store];
      console.log('CSV 파일 경로:', csvPath);

      if (!fs.existsSync(csvPath)) {
        console.error(`CSV 파일이 존재하지 않습니다: ${csvPath}`);
        continue;
      }

      const fileContent = fs.readFileSync(csvPath, 'utf-8');
      const { data } = papaparse.parse(fileContent, {
        header: true,
        skipEmptyLines: true
      });

      if (data.length === 0) {
        console.warn(`${store} 데이터가 비어있습니다.`);
        continue;
      }

      console.log('첫 번째 데이터:', data[0]);
      console.log('CSV 헤더:', Object.keys(data[0]));

      const parsePriceByStore = {
        family_mart: (priceStr) => {
          try {
            const basePrice = parseInt(priceStr.replace(/[^0-9]/g, ''));
            return Math.round(basePrice * 1.08); // 세금 포함 가격으로 변환
          } catch (e) {
            return 0;
          }
        },
        lawson: (priceStr) => {
          try {
            const basePrice = parseInt(priceStr.replace(/[^0-9]/g, ''));
            return Math.round(basePrice * 1.08); // 세금 포함 가격으로 변환
          } catch (e) {
            return 0;
          }
        },
        seven_eleven: (priceStr) => {
          try {
            // 세븐일레븐은 세금 포함 가격만 사용
            const taxMatch = priceStr.match(/税込(\d+[\.\d]*)/);
            if (taxMatch) {
              const taxPrice = taxMatch[1].replace('.', '');
              return parseInt(taxPrice);
            }
            // 세금 포함 가격을 찾지 못한 경우 기본 가격에 세금 적용
            const priceMatch = priceStr.match(/(\\)?(\d+)/);
            if (priceMatch) {
              const basePrice = parseInt(priceMatch[2]);
              return Math.round(basePrice * 1.08);
            }
            const cleanPrice = priceStr.replace(/[^0-9]/g, '');
            if (cleanPrice.length > 6) {
              return parseInt(cleanPrice.substring(0, 4));
            }
            const basePrice = parseInt(cleanPrice) || 0;
            return Math.round(basePrice * 1.08);
          } catch (e) {
            console.warn(`세븐일레븐 가격 처리 오류: ${priceStr}`, e);
            return 0;
          }
        }
      };

      const mappedData = data.map(item => {
        const productName = item.product_name || item.name || item['상품명'] || '';
        const translatedName = item.translated_name || item.translatedName || item['번역명'] || '';
        let priceValue = item.price || item['가격'] || '0';
        let imageUrl = item.img_url || item.imageUrl || item['이미지URL'] || '';
        
        const price = parsePriceByStore[store](priceValue);
        
        return {
          name: productName,
          translatedName: translatedName,
          price: price,
          imageUrl: imageUrl,
          category: categoryNames[store]
        };
      }).filter(item => item.name && item.price > 0);

      if (mappedData.length === 0) {
        console.warn(`${store}에 유효한 데이터가 없습니다.`);
        continue;
      }

      const result = await ConvenienceProduct.insertMany(mappedData);
      console.log(`${result.length}개의 레코드가 convenience 컬렉션에 저장되었습니다.`);
      
      const samples = await ConvenienceProduct.find({ category: categoryNames[store] }).limit(3);
      console.log(`${store} 샘플 데이터:`, samples.map(s => ({
        name: s.name,
        price: s.price,
        category: s.category
      })));
    }

  } catch (error) {
    console.error('에러 발생:', error);
    console.error('에러 스택:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB 연결이 종료되었습니다.');
  }
}

// 기존 세븐일레븐 데이터 가격 수정 함수
async function fixSevenElevenPrices() {
  try {
    console.log('세븐일레븐 가격 수정 시작...');
    const uri = process.env.MONGODB_URI;
    
    // URI 처리 로직 수정
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB 연결 성공');
    
    const ConvenienceProduct = mongoose.model('convenience', convenienceProductSchema, 'convenience');
    
    const allProducts = await ConvenienceProduct.find({ category: 'seveneleven' });
    console.log(`세븐일레븐 상품 ${allProducts.length}개 조회됨`);
    
    let fixed = 0;
    for (const product of allProducts) {
      const originalPrice = product.price;
      
      let newPrice = originalPrice;
      
      if (originalPrice > 10000) {
        const priceStr = originalPrice.toString();
        
        if (priceStr.length >= 8) {
          newPrice = parseInt(priceStr.substring(0, 3));
        } else if (priceStr.length >= 6) {
          newPrice = parseInt(priceStr.substring(0, 3));
        }
      }
      
      // 세금 포함 가격으로 변환
      newPrice = Math.round(newPrice * 1.08);
      
      if (newPrice !== originalPrice) {
        await ConvenienceProduct.updateOne(
          { _id: product._id },
          { 
            $set: { 
              price: newPrice
            } 
          }
        );
        fixed++;
        console.log(`상품 '${product.name}' 가격 수정: ${originalPrice} -> ${newPrice}`);
      }
    }
    
    console.log(`총 ${fixed}개의 세븐일레븐 상품 가격이 수정되었습니다.`);
    
    const samples = await ConvenienceProduct.find({ category: 'seveneleven' }).limit(5);
    console.log('수정 후 세븐일레븐 샘플 데이터:');
    samples.forEach(s => {
      console.log(`- ${s.name}: ${s.price}엔`);
    });

  } catch (error) {
    console.error('가격 수정 중 에러 발생:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB 연결이 종료되었습니다.');
  }
}

// 옵션 1: 새로 데이터 가져오기
importConvenienceCSV();

// 옵션 2: 기존 세븐일레븐 데이터 가격 수정하기
// fixSevenElevenPrices();