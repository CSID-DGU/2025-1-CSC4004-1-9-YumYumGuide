const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * 레스토랑 스키마 정의
 * 시부야_restaurant_details.csv 파일의 필드와 매핑
 */
const RestaurantSchema = new Schema({
  // 기본 정보
  name: {
    type: String,
    required: true,
    trim: true
  },
  translatedName: {
    type: String,
    trim: true
  },
  tel: {
    type: String,
    trim: true
  },
  
  // 장르 정보 (육, 해, 디저트, 면, 밥, 술)
  genre: {
    type: String,
    trim: true
  },
  
  // 영업 정보
  businessHours: {
    type: String,
    trim: true
  },
  regularHoliday: {
    type: String,
    trim: true
  },
  
  // 예산 정보 (점심, 저녁 분리)
  budget: {
    type: String,
    trim: true
  },
  lunchBudget: {
    type: String,
    trim: true
  },
  dinnerBudget: {
    type: String,
    trim: true
  },
  
  // 위치 정보
  address: {
    type: String,
    trim: true
  },
  accessInfo: {
    type: String,
    trim: true
  },
  parking: {
    type: String,
    trim: true
  },
  
  // 시설 정보
  seats: {
    type: Number,
    default: 0
  },
  counterSeats: {
    type: Boolean,
    default: false
  },
  smoking: {
    type: Boolean,
    default: false
  },
  privateRoom: {
    type: Boolean,
    default: false
  },
  private: {
    type: Boolean,
    default: false
  },
  
  // 드레스코드
  dressCode: {
    type: String,
    enum: ['없음', '캐주얼', '정장'],
    default: '없음'
  },
  
  // 요리 특징
  cuisineFeatures: {
    type: String,
    trim: true
  },
  
  // 편의 시설
  wifi: {
    type: Boolean,
    default: false
  },
  
  // 음료 및 음식 정보
  unlimitedDrinks: {
    type: Boolean,
    default: false
  },
  drinkFeatures: {
    type: String,
    trim: true
  },
  unlimitedFood: {
    type: Boolean,
    default: false
  },
  courses: {
    type: String,
    trim: true
  },
  
  // 결제 정보
  creditCard: {
    type: Boolean,
    default: true
  },
  qrPayment: {
    type: Boolean,
    default: false
  },
  icCardPayment: {
    type: Boolean,
    default: false
  },
  
  // 기타 편의 시설
  childrenAllowed: {
    type: Boolean,
    default: true
  },
  petsAllowed: {
    type: Boolean,
    default: false
  },
  powerOutlets: {
    type: Boolean,
    default: false
  },
  foreignLanguageSupport: {
    type: String,
    trim: true
  },
  
  // 예약 및 대기 정보
  reservation: {
    type: String,
    trim: true
  },
  waitingInfo: {
    type: String,
    trim: true
  },
  
  // 사용 용도
  usageScenes: {
    type: String,
    trim: true
  },
  
  // 서비스 정보
  serviceInfo: {
    type: String,
    trim: true
  },
  
  // 추가 정보
  remarks: {
    type: String,
    trim: true
  },
  additionalEquipment: {
    type: String, 
    trim: true
  },
  nearbyFacilities: {
    type: String,
    trim: true
  },
  beerMaker: {
    type: String,
    trim: true
  },
  
  // 웹사이트 및 소셜 미디어
  website: {
    type: String,
    trim: true
  },
  facebook: {
    type: String,
    trim: true
  },
  twitter: {
    type: String,
    trim: true
  },
  instagram: {
    type: String,
    trim: true
  },
  shopJobInfo: {
    type: String,
    trim: true
  },
  
  // 사진 정보
  photos: {
    menuPhotos: [{
      type: String,
      trim: true
    }], // 최대 3장
    chefPhoto: {
      type: String,
      trim: true
    },
    interiorPhoto: {
      type: String,
      trim: true
    }
  },
  
  // 메뉴 정보
  menus: [{
    name: {
      type: String,
      trim: true
    },
    price: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  
  // 추천 메뉴
  recommendedMenus: [{
    name: {
      type: String,
      trim: true
    },
    price: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  
  // 시스템 필드
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  // 스키마 옵션
  timestamps: true,
  versionKey: false,
  
  // 가상 필드 활성화 (필요시)
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 인덱스 추가 - 이름 검색 성능 향상
RestaurantSchema.index({ name: 'text', translatedName: 'text' });

// 필드 매핑을 위한 정적 메소드 추가 (CSV 필드명과 스키마 필드 매핑)
RestaurantSchema.statics.mapCSVToSchema = function(csvData) {
  console.log('mapCSVToSchema 메소드 실행됨', csvData.length);
  
  // 필드 매핑 테이블 (CSV 필드명 -> 스키마 필드명)
  const fieldMap = {
    // Basic information
    'name': 'name',
    'translatedName': 'translatedName',
    'tel': 'tel',
    'phoneNumber': 'tel',
    
    // Genre information
    'genre': 'genre',
    
    // Business information
    'businessHours': 'businessHours',
    'regularHoliday': 'regularHoliday',
    
    // Budget information
    'budget': 'budget',
    
    // Location information
    'address': 'address',
    'access': 'accessInfo',
    'parking': 'parking',
    
    // Facility information
    'seats': 'seats',
    'counterSeats': 'counterSeats',
    'smoking': 'smoking',
    'privateRoom': 'privateRoom',
    'private': 'private',
    
    // Dress code
    'dressCode': 'dressCode',
    
    // Cuisine features
    'cuisineFeatures': 'cuisineFeatures',
    
    // Convenience facilities
    'wifi': 'wifi',
    
    // Drink and food information
    'unlimitedDrinks': 'unlimitedDrinks',
    'drinkFeatures': 'drinkFeatures',
    'courses': 'courses',
    
    // Payment information
    'creditCard': 'creditCard',
    'qrPayment': 'qrPayment',
    'icCardPayment': 'icCardPayment',
    
    // Other convenience facilities
    'childrenAllowed': 'childrenAllowed',
    'petsAllowed': 'petsAllowed',
    'powerOutlets': 'powerOutlets',
    'foreignLanguageSupport': 'foreignLanguageSupport',
    
    // Reservation and waiting information
    'reservation': 'reservation',
    'waiting': 'waitingInfo',
    
    // Usage purpose
    'usageScenes': 'usageScenes',
    
    // Service information
    'service': 'serviceInfo',
    
    // Additional information
    'remarks': 'remarks',
    'additionalEquipment': 'additionalEquipment',
    'nearbyFacilities': 'nearbyFacilities',
    'beerMaker': 'beerMaker',
    
    // Website and social media
    'website': 'website',
    'facebook': 'facebook',
    'twitter': 'twitter',
    'instagram': 'instagram',
    'shopJobInfo': 'shopJobInfo'
  };
  
  // 한글-영어 매핑 테이블 (CSV에서 영어 필드로 변환하기 위함)
  const koreanToEnglishMap = {
    '식당 이름': 'name',
    '번역된 식당 이름': 'translatedName',
    '텔': 'tel',
    '전화 번호': 'phoneNumber',
    '장르': 'genre',
    '영업 시간': 'businessHours',
    '닫힌 날': 'regularHoliday',
    '예산': 'budget',
    '주소': 'address',
    '입장': 'access',
    '주차': 'parking',
    '좌석': 'seats',
    '카운터 좌석': 'counterSeats',
    '흡연': 'smoking',
    '개인 실': 'privateRoom',
    '사적인': 'private',
    '드레스 코드': 'dressCode',
    '요리 기능과 전문 분야': 'cuisineFeatures',
    'Wi-Fi 사용': 'wifi',
    '당신이 마실 수있는 모든 것': 'unlimitedDrinks',
    '마시는 기능과 세부 사항에 대한 관심': 'drinkFeatures',
    '강의': 'courses',
    '신용 카드': 'creditCard',
    'QR 코드 결제': 'qrPayment',
    'IC 카드 지불': 'icCardPayment',
    '아이들이 들어 오세요': 'childrenAllowed',
    '애완 동물': 'petsAllowed',
    '전원 공급 장치 사용': 'powerOutlets',
    '외국어 지원': 'foreignLanguageSupport',
    '예약': 'reservation',
    '대기': 'waiting',
    '사용 장면': 'usageScenes',
    '서비스': 'service',
    '발언': 'remarks',
    '추가 장비': 'additionalEquipment',
    '인근 시설': 'nearbyFacilities',
    '맥주 제작자': 'beerMaker',
    '상점 웹 사이트': 'website',
    '페이스 북': 'facebook',
    'X (트위터)': 'twitter',
    '인스 타 그램': 'instagram',
    '쇼핑 직무 정보': 'shopJobInfo'
  };
  
  // Boolean 변환 함수
  const booleanConverter = (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lowered = value.toLowerCase();
      return lowered === '예' || 
             lowered === 'yes' || 
             lowered === 'true' || 
             lowered === '가능' ||
             lowered === 'o' ||
             lowered === '⭕' ||
             lowered === '✓' ||
             lowered === '○';
    }
    return false;
  };
  
  // 1. 한글 CSV 데이터를 영어 키로 변환
  console.log('한글 키를 영어 키로 변환 시작');
  const englishCsvData = csvData.map(item => {
    const englishItem = {};
    
    Object.entries(item).forEach(([koreanKey, value]) => {
      const englishKey = koreanToEnglishMap[koreanKey];
      if (englishKey) {
        englishItem[englishKey] = value;
      } else {
        // 매핑되지 않은 키는 그대로 유지 (옵션)
        englishItem[koreanKey] = value;
      }
    });
    
    return englishItem;
  });
  console.log('한글 키를 영어 키로 변환 완료');
  
  // 2. 영어 키를 가진 데이터를 스키마 필드로 매핑
  console.log('스키마 필드 매핑 시작');
  return englishCsvData.map(item => {
    const result = {};
    
    // 예산 분리 (추후 수정 가능)
    result.lunchBudget = '';
    result.dinnerBudget = '';
    
    // 각 필드 매핑
    Object.entries(item).forEach(([key, value]) => {
      // 매핑 테이블에 있는 필드인 경우
      const schemaField = fieldMap[key];
      
      if (schemaField && value !== '' && value !== null && value !== undefined) {
        // Boolean 필드인 경우 변환
        if (['counterSeats', 'smoking', 'privateRoom', 'private', 'wifi', 
             'unlimitedDrinks', 'creditCard', 'qrPayment', 'icCardPayment',
             'childrenAllowed', 'petsAllowed', 'powerOutlets'].includes(schemaField)) {
          result[schemaField] = booleanConverter(value);
        } 
        // 좌석 수(숫자)인 경우 변환
        else if (schemaField === 'seats') {
            
            // 문자열에서 첫 번째 숫자만 추출
            const firstNumberMatch = value.toString().match(/\d+/);
            
            if (firstNumberMatch) {
              const firstNumber = parseInt(firstNumberMatch[0]);
              result[schemaField] = firstNumber;
            } else {
              // 숫자가 없는 경우 기본값 0 설정
              result[schemaField] = 0;
            }
        }
        // 예산 처리 - CSV에서는 단일 필드지만 스키마에서는 점심/저녁 분리 가능
        else if (schemaField === 'budget') {
          result[schemaField] = value;
          // 예산 값에 점심/저녁 구분이 있는 경우를 위한 로직
          if (value.includes('점심') || value.includes('런치')) {
            const lunchMatch = value.match(/점심[:\s]*([\d,]+원)/);
            if (lunchMatch) result.lunchBudget = lunchMatch[1];
          }
          if (value.includes('저녁') || value.includes('디너')) {
            const dinnerMatch = value.match(/저녁[:\s]*([\d,]+원)/);
            if (dinnerMatch) result.dinnerBudget = dinnerMatch[1];
          }
        }
        // 그 외 일반 필드
        else {
          result[schemaField] = value;
        }
      }
    });
    
    // 사진 필드 초기화
    result.photos = {
      menuPhotos: [],
      chefPhoto: null,
      interiorPhoto: null
    };
    
    // 메뉴 정보와 추천 메뉴는 빈 배열로 초기화
    result.menus = [];
    result.recommendedMenus = [];
    
    return result;
  });
};

module.exports = mongoose.model('Restaurant', RestaurantSchema);