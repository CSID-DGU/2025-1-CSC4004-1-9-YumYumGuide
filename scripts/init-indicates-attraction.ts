import { Client } from '@elastic/elasticsearch';
import fs from 'fs';

(async () => {
  const es = new Client({ node: process.env.ES_NODE! });
  const body = JSON.parse(fs.readFileSync('scripts/init-indices.json', 'utf8'));

  const exists = await es.indices.exists({ index: 'attractions' });
  if (!exists) {
    await es.indices.create({ index: 'attractions', body });
    console.log('attractions 인덱스 생성 완료');
  } else {
    console.log('이미 인덱스가 존재합니다');
  }
})();
// npx ts-node scripts/init-indices.ts
