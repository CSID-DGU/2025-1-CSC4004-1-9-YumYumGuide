const mongoose = require('mongoose');

// 한글-영어 매핑 테이블
const koreanToEnglishMap = {
  '명소': 'name',
  '카테고리': 'category',
  '설명': 'description',
  '주소': 'address'
};

// 스키마 정의
const TouristSpotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

// 인덱스 추가
TouristSpotSchema.index({ name: 'text', description: 'text' });

// 정적 메서드로 매핑 함수 추가
TouristSpotSchema.statics.mapCSVToSchema = function(csvData) {
  return csvData.map(item => {
    const result = {};
    Object.entries(item).forEach(([koreanKey, value]) => {
      const englishKey = koreanToEnglishMap[koreanKey];
      if (englishKey) {
        result[englishKey] = value;
      }
    });
    return result;
  });
};

// 모델 생성 및 내보내기
const TouristSpot = mongoose.model('TouristSpot', TouristSpotSchema);
module.exports = TouristSpot;