import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const fontUrl = 'https://cdn.jsdelivr.net/npm/noto-sans-devanagari@2.0.0/fonts/ttf/NotoSansDevanagari-Regular.ttf';
    
    const response = await fetch(fontUrl);

    if (!response.ok) {
      return new NextResponse('Failed to fetch font', { status: response.status });
    }

    const fontBuffer = await response.arrayBuffer();

    return new NextResponse(fontBuffer, {
      headers: {
        'Content-Type': 'font/ttf',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error fetching font:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
