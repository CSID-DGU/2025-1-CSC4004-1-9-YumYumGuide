// scripts/seed-restaurants.ts
import 'dotenv/config';           
import mongoose from 'mongoose';              // .env 사용 시
import { connect, disconnect } from 'mongoose';
import { Restaurant, RestaurantSchema } from '../backend/src/search/schemas/restaurant.schema';
import { Client } from '@elastic/elasticsearch';

async function seedRestaurants() {
  /* 1) Mongo 연결 */
  await connect(process.env.MONGO_URI!);
  const RestaurantModel = mongoose.model<Restaurant>('Restaurant', RestaurantSchema, 'restaurants');

  /* 2) Elasticsearch 클라이언트 */
  const es = new Client({ node: process.env.ES_NODE! });

  /* 3) Mongo → ES bulk */
  const docs = await RestaurantModel.find().lean();
  const body = docs.flatMap(d => [
    { index: { _index: 'restaurants', _id: d._id.toString() } },
    {
      translated_restaurant_name: d.translated_restaurant_name,
      genre  : d.genre,
      location: d.address,
    },
  ]);

  if (body.length) {
    const { errors } = await es.bulk({ refresh: true, body });
    console.log(errors ? '실패' : '모든 문서 마이그레이션 완료');
  } else {
    console.log('빈 컬렉션입니다.');
  }

  await disconnect();
}

seedRestaurants().catch(e => {
  console.error(e);
  process.exit(1);
});
