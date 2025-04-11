const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * 레스토랑 스키마 정의
 * CSV 파일의 필드와 매핑되도록 구성
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
  genre: {
    type: String,
    trim: true
  },
  
  // 영업 정보
  businessHours: {
    type: String,
    trim: true
  },
  closedDays: {
    type: String,
    trim: true
  },
  budget: {
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
  totalSeats: {
    type: String,
    trim: true
  },
  counterSeats: {
    type: String,
    trim: true
  },
  smokingInfo: {
    type: String,
    trim: true
  },
  privateRooms: {
    type: String,
    trim: true
  },
  
  // 결제 정보
  creditCards: {
    type: String,
    trim: true
  },
  qrPayment: {
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
  
  // 기타 정보
  remarks: {
    type: String,
    trim: true
  },
  courses: {
    type: String,
    trim: true
  },
  drinkOptions: {
    type: String,
    trim: true
  },
  features: {
    type: String,
    trim: true
  },
  
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
  // 필드 매핑 테이블 (CSV 필드명 -> 스키마 필드명)
  const fieldMap = {
    '식당 이름': 'name',
    '식당_이름': 'name',
    'しゃぶ禅_渋谷店': 'name',
    '번역된 식당 이름': 'translatedName',
    '번역된_식당_이름': 'translatedName',
    'Shabu_Zen_Shibuya_상점': 'translatedName',
    '텔': 'tel',
    '전화_번호': 'tel',
    '장르': 'genre',
    'ジャンル': 'genre',
    '영업 시간': 'businessHours',
    '영업_시간': 'businessHours',
    '닫힌 날': 'closedDays',
    '닫힌_날': 'closedDays',
    '예산': 'budget',
    '주소': 'address',
    // ... 기타 필드 매핑
  };
  
  // 데이터 변환
  return csvData.map(item => {
    const result = {};
    
    // 각 필드 매핑
    Object.entries(item).forEach(([key, value]) => {
      // 매핑 테이블에 있는 필드인 경우
      const schemaField = fieldMap[key] || key;
      
      // 값이 있는 경우에만 추가
      if (value !== '' && value !== null && value !== undefined) {
        result[schemaField] = value;
      }
    });
    
    return result;
  });
};

module.exports = mongoose.model('Restaurant', RestaurantSchema);