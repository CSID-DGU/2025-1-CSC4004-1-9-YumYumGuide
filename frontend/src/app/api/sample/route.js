// src/app/api/sample/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://jyh:wizz5644@yumyum.ytfd9lu.mongodb.net/?retryWrites=true&w=majority&appName=yumyum';

export async function GET() {
  console.log('API 호출 시작');
  try {
    // MongoDB 연결
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB 연결 시도...');
      await mongoose.connect(MONGODB_URI);
      console.log('MongoDB 연결 성공');
    }
    
    const db = mongoose.connection.db;
    
    // 데이터 가져오기
    console.log('데이터베이스 선택 완료');
    
    // 사용 가능한 컬렉션 목록 가져오기
    const collections = await db.listCollections().toArray();
    console.log('사용 가능한 컬렉션:', collections.map(c => c.name));
    
    // 첫 번째 컬렉션에서 데이터 가져오기
    if (collections.length > 0) {
      const firstCollection = collections[0].name;
      const data = await db.collection(firstCollection).find({}).limit(10).toArray();
      console.log('데이터 조회 완료:', data.length, '개의 문서');
      
      return NextResponse.json({
        success: true,
        data: data,
        collection: firstCollection
      });
    } else {
    return NextResponse.json({
      success: true,
        message: '데이터베이스에 컬렉션이 없습니다.',
        data: []
    });
    }
    
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}