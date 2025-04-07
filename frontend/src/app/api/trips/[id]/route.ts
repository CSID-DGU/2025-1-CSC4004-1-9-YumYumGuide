import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  // context.params를 비동기적으로 처리
  const params = await Promise.resolve(context.params);
  const id = params.id;

  // 여기서는 목업 데이터를 반환합니다
  // 실제 프로젝트에서는 데이터베이스 조회 로직이 들어갑니다
  const tripData = {
    id: id,
    name: '규카츠 모토무라 시부야점',
    location: 'Shibuya, Tokyo',
    area: 'Shibuya',
    rating: 4.2,
    reviewCount: 203,
    price: '¥890/1인',
    keywords: ['맛있다', '깨끗하다', '친절하다'],
    image: '/restaurant.png',
    description: '시부야에 위치한 유명한 규카츠 전문점입니다. 바삭하고 두꺼운 돈까스와 특제 소스가 일품이며, 현지인들에게도 인기가 많은 맛집입니다. 직원들이 매우 친절하고 가게 내부도 깨끗하게 유지되고 있습니다. 시부야역에서 도보 5분 거리에 위치해 있어 접근성도 좋습니다.',
    createdBy: 'LoveTrip'
  };

  return NextResponse.json(tripData);
}