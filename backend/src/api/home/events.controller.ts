import { Controller, Get } from '@nestjs/common';
import { MongoClient } from 'mongodb';

@Controller('api/home/events')
export class EventsController {
  private readonly uri = process.env.MONGODB_URI;

  @Get()
  async getAllEvents() {
    console.log('[API] /api/home/events 전체 호출');
    const client = new MongoClient(this.uri!);
    try {
      await client.connect();
      const database = client.db('main');
      const attractions = database.collection('attractions');
      const allEvents = await attractions
        .find({ category: '축제', date: { $exists: true, $ne: null } })
        .project({ attraction: 1, description: 1, address: 1, image: 1, date: 1, price: 1 })
        .toArray();
      return allEvents;
    } finally {
      await client.close();
    }
  }

  @Get('future')
  async getFutureEvents() {
    console.log('[API] /api/home/events/future 호출됨');
    const client = new MongoClient(this.uri!);
    try {
      await client.connect();
      const database = client.db('main');
      const attractions = database.collection('attractions');
      const allEvents = await attractions
        .find({ category: '축제', date: { $exists: true, $ne: null } })
        .project({ attraction: 1, description: 1, address: 1, image: 1, date: 1, price: 1 })
        .toArray();

      const today = new Date();
      const thisMonth = today.getMonth() + 1;
      const filteredEvents = allEvents
        .filter((event: any) => {
          if (!event.date) return false;
          const monthStr = event.date.split('.')[0];
          const month = parseInt(monthStr, 10);
          return month >= thisMonth;
        })
        .slice(0, 2);

      return filteredEvents;
    } finally {
      await client.close();
    }
  }
} 