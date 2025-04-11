// src/app/api/sample/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
  console.log('1111');
  try {
    // MongoDB 연결
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect('mongodb+srv://jyh:wizz5644@yumyum.ytfd9lu.mongodb.net/?retryWrites=true&w=majority&appName=yumyum');
    }
    
    const db = mongoose.connection.db;
    
    // 데이터 가져오기
    const sampleMflixDb = mongoose.connection.useDb('sample_mflix');
    const data = await sampleMflixDb.collection('movies').find({}).limit(10).toArray();
    console.log(data, 'dddddd');
    return NextResponse.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}