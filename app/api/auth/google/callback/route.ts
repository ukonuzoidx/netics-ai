import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getConvexClient } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    // Store tokens in Convex
    const convex = getConvexClient();
    await convex.mutation(api.integrations.storeGoogleTokens, {
      userId,
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token || '',
      expiryDate: tokens.expiry_date || Date.now() + 3600000,
    });

    return NextResponse.redirect(new URL('/dashboard?connected=google', request.url));
  } catch (error) {
    console.error('Error getting tokens:', error);
    return NextResponse.redirect(new URL('/dashboard?error=google_auth_failed', request.url));
  }
}
