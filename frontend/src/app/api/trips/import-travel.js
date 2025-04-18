// pages/api/tourist-spots/index.js
import dbConnect from '../../../db/dbConnect';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  await dbConnect();
  
  // 관광 명소 모델 가져오기
  const TouristSpot = mongoose.models.TouristSpot || 
    mongoose.model('TouristSpot', new mongoose.Schema({
      name: String,
      category: String,
      description: String,
      address: String,
      operatingHours: String,
      entranceFee: String,
      contactNumber: String,
      website: String,
      location: {
        type: { type: String },
        coordinates: [Number]
      },
      images: [String],
      tags: [String],
      createdAt: Date,
      updatedAt: Date
    }, { 
      timestamps: true 
    }));
  
  switch (req.method) {
    case 'GET':
      try {
        // 페이지네이션 및 필터 파라미터
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // 검색 및 필터 조건 구성
        const query = {};
        
        // 검색어 처리
        if (req.query.search) {
          query.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { description: { $regex: req.query.search, $options: 'i' } }
          ];
        }
        
        // 카테고리 필터
        if (req.query.category) {
          query.category = req.query.category;
        }
        
        // 총 문서 수 계산
        const total = await TouristSpot.countDocuments(query);
        
        // 데이터 조회
        const spots = await TouristSpot.find(query)
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(limit);
        
        // 총 페이지 수 계산
        const totalPages = Math.ceil(total / limit);
        
        res.status(200).json({
          success: true,
          spots,
          pagination: {
            total,
            page,
            limit,
            totalPages
          },
          totalPages
        });
      } catch (error) {
        console.error('API 오류:', error);
        res.status(500).json({ success: false, error: error.message });
      }
      break;
      
    case 'POST':
      try {
        // 새 관광 명소 추가
        const spot = await TouristSpot.create(req.body);
        res.status(201).json({ success: true, data: spot });
      } catch (error) {
        console.error('API 오류:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
      
    default:
      res.status(405).json({ success: false, error: '허용되지 않는 메서드입니다.' });
      break;
  }
}

// pages/api/tourist-spots/[id].js
export async function getSpot(req, res) {
  await dbConnect();
  
  const { id } = req.query;
  
  // 유효한 ObjectId인지 확인
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, error: '유효하지 않은 ID입니다.' });
  }
  
  // 관광 명소 모델 가져오기
  const TouristSpot = mongoose.models.TouristSpot || 
    mongoose.model('TouristSpot', new mongoose.Schema({}, { strict: false }));
  
  switch (req.method) {
    case 'GET':
      try {
        const spot = await TouristSpot.findById(id);
        
        if (!spot) {
          return res.status(404).json({ success: false, error: '관광 명소를 찾을 수 없습니다.' });
        }
        
        res.status(200).json({ success: true, data: spot });
      } catch (error) {
        console.error('API 오류:', error);
        res.status(500).json({ success: false, error: error.message });
      }
      break;
      
    case 'PUT':
      try {
        const spot = await TouristSpot.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true
        });
        
        if (!spot) {
          return res.status(404).json({ success: false, error: '관광 명소를 찾을 수 없습니다.' });
        }
        
        res.status(200).json({ success: true, data: spot });
      } catch (error) {
        console.error('API 오류:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
      
    case 'DELETE':
      try {
        const deletedSpot = await TouristSpot.findByIdAndDelete(id);
        
        if (!deletedSpot) {
          return res.status(404).json({ success: false, error: '관광 명소를 찾을 수 없습니다.' });
        }
        
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        console.error('API 오류:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
      
    default:
      res.status(405).json({ success: false, error: '허용되지 않는 메서드입니다.' });
      break;
  }
}

// pages/api/tourist-spots/categories.js
export async function getCategories(req, res) {
  await dbConnect();
  
  // 관광 명소 모델 가져오기
  const TouristSpot = mongoose.models.TouristSpot || 
    mongoose.model('TouristSpot', new mongoose.Schema({}, { strict: false }));
  
  if (req.method === 'GET') {
    try {
      // 고유한 카테고리 목록 가져오기
      const categories = await TouristSpot.distinct('category');
      
      // null 및 빈 문자열 제거
      const validCategories = categories
        .filter(category => category)
        .sort();
      
      res.status(200).json({
        success: true,
        categories: validCategories
      });
    } catch (error) {
      console.error('API 오류:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, error: '허용되지 않는 메서드입니다.' });
  }
}