
import { NextResponse } from 'next/server';

export async function GET(req) {
  const response = NextResponse.redirect(new URL('/', req.url)); // ✅ absolute URL
  response.cookies.set('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return response;
}

