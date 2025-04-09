// frontend/src/app/api/trips/route.js
import dbConnect from '../../../../../../backend/db/connection';
import Trip from '../../../../../../backend/models/trip';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    const trips = await Trip.find({});
    return NextResponse.json(trips, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    await dbConnect();
    const newTrip = await Trip.create(body);
    return NextResponse.json(newTrip, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}