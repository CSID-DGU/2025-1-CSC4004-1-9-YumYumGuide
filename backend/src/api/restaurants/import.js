const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const Restaurant = require('../../../backend/models/Restauarnt');

const router = express.Router();

// 파일 업로드를 위한 multer 설정
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../../../backend/data/uploads');
    
    // 디렉토리가 없으면 생성
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // 파일명 중복 방지를 위해 타임스탬프 추가
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'restaurants-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 파일 필터링 - CSV 파일만 허용
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
    cb(null, true);
  } else {
    cb(new Error('CSV 파일만 업로드 가능합니다.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB 제한
});

/**
 * CSV 파일을 파싱하는 함수
 * 
 * @param {string} filePath - CSV 파일 경로
 * @returns {Promise<Array>} - 파싱된 데이터 배열
 */
function parseCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    try {
      // UTF-8로 파일 읽기 (인코딩 문제 해결)
      const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
      
      // BOM 제거 (UTF-8 파일의 시작 부분에 있을 수 있는 마커)
      const contentWithoutBOM = fileContent.replace(/^\uFEFF/, '');
      
      // CSV 파싱 설정
      Papa.parse(contentWithoutBOM, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => {
          // 헤더 이름 정리 (공백 제거 및 MongoDB 호환성 위한 처리)
          return header.trim().replace(/\./g, '_').replace(/\$/g, '_');
        },
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn('CSV 파싱 경고:', results.errors);
          }
          
          // 데이터 정제
          const cleanedData = results.data.map(row => {
            const cleanRow = {};
            
            // 각 필드 처리
            Object.keys(row).forEach(key => {
              // 빈 문자열을 null로 변환
              const value = row[key] === '' ? null : row[key];
              
              // 필드명 정제
              const cleanKey = key.trim().replace(/\./g, '_').replace(/\$/g, '_');
              
              cleanRow[cleanKey] = value;
            });
            
            return cleanRow;
          });
          
          resolve(cleanedData);
        },
        error: (error) => {
          reject(error);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * @route POST /api/restaurants/import
 * @desc CSV 파일을 업로드하고 데이터베이스에 가져오기
 * @access Private
 */
router.post('/', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'CSV 파일이 필요합니다' });
    }
    
    console.log(`파일 업로드 성공: ${req.file.originalname} (${req.file.size} bytes)`);
    
    // CSV 파일 파싱
    const csvData = await parseCSVFile(req.file.path);
    console.log(`${csvData.length}개의 항목이 파싱되었습니다`);
    
    // 샘플 데이터 로깅
    if (csvData.length > 0) {
      console.log('파싱된 첫 번째 항목:', JSON.stringify(csvData[0], null, 2));
    }
    
    // 스키마에 맞게 데이터 매핑
    const mappedData = Restaurant.mapCSVToSchema(csvData);
    
    // 필터링: 이름이 있는 항목만 유지
    const validData = mappedData.filter(item => item.name);
    
    if (validData.length === 0) {
      return res.status(400).json({ 
        message: '가져올 유효한 데이터가 없습니다. CSV 파일 형식과 내용을 확인하세요.'
      });
    }
    
    // 데이터베이스에 삽입
    const result = await Restaurant.insertMany(validData);
    
    // 업로드된 파일 삭제 (선택적)
    fs.unlinkSync(req.file.path);
    
    res.json({
      message: '데이터 가져오기 성공',
      count: result.length,
      firstItem: result[0]
    });
  } catch (error) {
    console.error('데이터 가져오기 오류:', error);
    
    // 파일이 존재하면 삭제 시도
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('임시 파일 삭제 오류:', unlinkError);
      }
    }
    
    res.status(500).json({
      message: '서버 오류 발생',
      error: error.message
    });
  }
});

module.exports = router;