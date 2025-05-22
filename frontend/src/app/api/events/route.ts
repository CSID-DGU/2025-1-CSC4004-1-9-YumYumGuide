import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri!);

export async function GET() {
  try {
    await client.connect();
    const database = client.db('main');
    const attractions = database.collection('attractions');

    // 이번달의 시작일 구하기
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const events = await attractions
      .find({ 
        category: '축제',
        date: { 
          $exists: true,  // date 필드가 존재하는 것만
          $ne: null,      // null이 아닌 것만
          $gte: firstDayOfMonth.toISOString() // 이번달 이후의 날짜
        }
      })
      .sort({ date: 1 }) // 날짜순으로 정렬
      // .limit(2) // 2개로 제한
      .project({ attraction: 1, image: 1, date: 1 })
      .toArray();
    console.log(events, 'ㅇㅇㅇㅇㅇ');
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  } finally {
    await client.close();
  }
} 