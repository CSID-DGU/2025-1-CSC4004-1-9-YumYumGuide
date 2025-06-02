// frontend/src/app/api/trips/route.js
import dbConnect from '../../../../../../backend/db/connection';
import Trip from '../../../../../../backend/models/trip';

import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // 쿼리 파라미터 가져오기
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect('mongodb+srv://jyh:wizz5644@yumyum.ytfd9lu.mongodb.net/?retryWrites=true&w=majority&appName=yumyum');
    }
    
    const db = mongoose.connection.db;
    
    // 영화 컬렉션에서 데이터 조회 (페이지네이션 적용)
    const skip = (page - 1) * limit;
    const movies = await db.collection('')
      .find({})
      .sort({ year: -1 }) // 최신 영화부터 정렬
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // 전체 영화 수 조회
    const total = await db.collection('sample_mflix.movies').countDocuments();
    
    return NextResponse.json({
      success: true,
      data: movies,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('영화 데이터 조회 오류:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}