const fs = require('fs');
const path = require('path');
const papaparse = require('papaparse');
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// 편의점 상품 스키마 정의
const convenienceProductSchema = new mongoose.Schema({
  name: String,
  translatedName: String,
  price: Number,
  priceWithTax: Number, // 세금 포함 가격 추가
  imageUrl: String,
  store: String
}, { versionKey: false });

async function importConvenienceCSV() {
  try {
    console.log('MongoDB 연결 시도...');
    const uri = process.env.MONGODB_URI;
    const uriWithoutDbAndParams = uri.split('/').slice(0, 3).join('/');
    const dbUri = `${uriWithoutDbAndParams}/convenienceDB`;
    
    // 파라미터 추가
    const finalUri = dbUri + (uri.includes('?') ? 
      `?${uri.split('?')[1]}` : 
      '?retryWrites=true&w=majority');
    
    const maskedFinalUri = finalUri.replace(/\/\/([^:]+):([^@]+)@/, '//********:********@');
    console.log('연결 URI:', maskedFinalUri);

    await mongoose.connect(finalUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB 연결 성공');
    
    // 현재 사용 중인 데이터베이스 확인
    const db = mongoose.connection.db;
    console.log('현재 연결된 데이터베이스:', db.databaseName);

    // 각 편의점별 CSV 파일 경로
    const stores = ['family_mart', 'lawson', 'seven_eleven'];
    const csvFiles = {
      family_mart: path.join(__dirname, '../data/family_mart_new_products.csv'),
      lawson: path.join(__dirname, '../data/lawson_new_products.csv'),
      seven_eleven: path.join(__dirname, '../data/seven_eleven_new_products.csv')
    };

    // 각 편의점별 컬렉션 이름
    const collectionNames = {
      family_mart: 'familymart',
      lawson: 'lawson',
      seven_eleven: 'seveneleven'
    };

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

      // 컬렉션 이름 설정
      const collectionName = collectionNames[store];
      const ConvenienceProduct = mongoose.model(
        collectionName, 
        convenienceProductSchema, 
        collectionName
      );
      
      // 기존 데이터 삭제
      await ConvenienceProduct.deleteMany({});
      console.log(`${collectionName} 컬렉션의 기존 데이터가 삭제되었습니다.`);

      // 각 편의점별 특화된 가격 파싱 함수
      const parsePriceByStore = {
        family_mart: (priceStr) => {
          // 패밀리마트 가격 처리
          try {
            return parseInt(priceStr.replace(/[^0-9]/g, ''));
          } catch (e) {
            return 0;
          }
        },
        lawson: (priceStr) => {
          // 로손 가격 처리
          try {
            return parseInt(priceStr.replace(/[^0-9]/g, ''));
          } catch (e) {
            return 0;
          }
        },
        seven_eleven: (priceStr) => {
          // 세븐일레븐 가격 처리 - 세금 정보가 포함된 특수 케이스
          try {
            // 가격 문자열 예시: "278(税込300.24)"
            const priceMatch = priceStr.match(/(\\)?(\d+)/);
            if (priceMatch) {
              // 첫 번째 숫자만 추출 (기본 가격)
              return parseInt(priceMatch[2]);
            }
            
            // 정규식으로 찾지 못한 경우 일반 숫자 추출
            const cleanPrice = priceStr.replace(/[^0-9]/g, '');
            if (cleanPrice.length > 6) {
              // 너무 긴 숫자인 경우 (세금 가격이 합쳐진 경우) 앞부분만 사용
              return parseInt(cleanPrice.substring(0, 4));
            }
            return parseInt(cleanPrice) || 0;
          } catch (e) {
            console.warn(`세븐일레븐 가격 처리 오류: ${priceStr}`, e);
            return 0;
          }
        }
      };

      // 세금 포함 가격 파싱 함수
      const parseTaxIncludedPrice = (priceStr) => {
        try {
          // "278(税込300.24)" 형식에서 세금 포함 가격 추출
          const taxMatch = priceStr.match(/税込(\d+[\.\d]*)/);
          if (taxMatch) {
            // 소수점 포함된 가격 처리
            const taxPrice = taxMatch[1].replace('.', '');
            return parseInt(taxPrice);
          }
          return 0;
        } catch (e) {
          return 0;
        }
      };

      // CSV 데이터 매핑
      const mappedData = data.map(item => {
        // CSV 헤더 키 이름 확인 및 매핑
        const productName = item.product_name || item.name || item['상품명'] || '';
        const translatedName = item.translated_name || item.translatedName || item['번역명'] || '';
        let priceValue = item.price || item['가격'] || '0';
        let imageUrl = item.img_url || item.imageUrl || item['이미지URL'] || '';
        
        // 스토어별 특화된 가격 파싱 적용
        const basePrice = parsePriceByStore[store](priceValue);
        
        // 세금 포함 가격 계산 (세븐일레븐만 적용)
        let priceWithTax = 0;
        if (store === 'seven_eleven') {
          priceWithTax = parseTaxIncludedPrice(priceValue);
        } else {
          // 다른 편의점은 세금 8% 자동 계산
          priceWithTax = Math.round(basePrice * 1.08);
        }
        
        return {
          name: productName,
          translatedName: translatedName,
          price: basePrice,
          priceWithTax: priceWithTax,
          imageUrl: imageUrl,
          store: store
        };
      }).filter(item => item.name && item.price > 0); // 이름이 있고 가격이 유효한 항목만 저장

      if (mappedData.length === 0) {
        console.warn(`${store}에 유효한 데이터가 없습니다.`);
        continue;
      }

      // 데이터 저장
      const result = await ConvenienceProduct.insertMany(mappedData);
      console.log(`${result.length}개의 레코드가 ${collectionName} 컬렉션에 저장되었습니다.`);
      
      // 저장된 데이터 샘플 출력
      const samples = await ConvenienceProduct.find().limit(3);
      console.log(`${collectionName} 샘플 데이터:`, samples.map(s => ({
        name: s.name,
        price: s.price,
        priceWithTax: s.priceWithTax
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
    const uriWithoutDbAndParams = uri.split('/').slice(0, 3).join('/');
    const dbUri = `${uriWithoutDbAndParams}/convenienceDB`;
    
    // 파라미터 추가
    const finalUri = dbUri + (uri.includes('?') ? 
      `?${uri.split('?')[1]}` : 
      '?retryWrites=true&w=majority');

    await mongoose.connect(finalUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB 연결 성공');
    
    // 세븐일레븐 컬렉션 가져오기
    const SevenEleven = mongoose.model('seveneleven', convenienceProductSchema, 'seveneleven');
    
    // 모든 세븐일레븐 데이터 가져오기
    const allProducts = await SevenEleven.find();
    console.log(`세븐일레븐 상품 ${allProducts.length}개 조회됨`);
    
    // 각 상품 가격 수정
    let fixed = 0;
    for (const product of allProducts) {
      const originalPrice = product.price;
      
      // 가격 수정 로직
      let newPrice = originalPrice;
      
      // 너무 큰 숫자인 경우 (예: 27830024)
      if (originalPrice > 10000) {
        // 먼저 문자열로 변환
        const priceStr = originalPrice.toString();
        
        // 원가격만 추출 (처음 3-4자리)
        if (priceStr.length >= 8) {
          // 8자리 이상: 앞의 3자리가 원가격으로 가정
          newPrice = parseInt(priceStr.substring(0, 3));
        } else if (priceStr.length >= 6) {
          // 6-7자리: 앞의 3자리가 원가격으로 가정
          newPrice = parseInt(priceStr.substring(0, 3));
        }
      }
      
      // 세금 포함 가격 계산
      const newPriceWithTax = Math.round(newPrice * 1.08);
      
      // 가격이 변경된 경우에만 업데이트
      if (newPrice !== originalPrice) {
        await SevenEleven.updateOne(
          { _id: product._id },
          { 
            $set: { 
              price: newPrice,
              priceWithTax: newPriceWithTax 
            } 
          }
        );
        fixed++;
        console.log(`상품 '${product.name}' 가격 수정: ${originalPrice} -> ${newPrice} (세금포함: ${newPriceWithTax})`);
      }
    }
    
    console.log(`총 ${fixed}개의 세븐일레븐 상품 가격이 수정되었습니다.`);
    
    // 수정 후 샘플 데이터 출력
    const samples = await SevenEleven.find().limit(5);
    console.log('수정 후 세븐일레븐 샘플 데이터:');
    samples.forEach(s => {
      console.log(`- ${s.name}: ${s.price}엔 (세금포함: ${s.priceWithTax}엔)`);
    });

  } catch (error) {
    console.error('가격 수정 중 에러 발생:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB 연결이 종료되었습니다.');
  }
}

// 두 가지 옵션 제공:
// 1. 새로운 데이터 가져오기
// 2. 기존 세븐일레븐 데이터 가격 수정하기

// 옵션 1: 새로 데이터 가져오기
// importConvenienceCSV();

// 옵션 2: 기존 세븐일레븐 데이터 가격 수정하기
fixSevenElevenPrices();