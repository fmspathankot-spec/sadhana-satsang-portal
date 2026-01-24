import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Get credentials from environment variables
const DEFAULT_USERNAME = process.env.AUTH_USERNAME || 'srspkt';
const DEFAULT_PASSWORD = process.env.AUTH_PASSWORD || 'srs@#pkt1313';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate credentials
    if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
      // Create session token (simple implementation)
      const sessionToken = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      
      // Set cookie
      const cookieStore = await cookies();
      cookieStore.set('session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return NextResponse.json(
        { 
          success: true,
          message: 'Login successful',
          user: { username }
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'गलत यूज़रनेम या पासवर्ड' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'लॉगिन में त्रुटि हुई' },
      { status: 500 }
    );
  }
}