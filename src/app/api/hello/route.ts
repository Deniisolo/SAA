import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Hello World!',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
}

export async function POST() {
  return NextResponse.json({
    message: 'Hello World desde POST!',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
}
