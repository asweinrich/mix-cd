import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accessToken = searchParams.get('accessToken');

  if (!accessToken) {
    return new NextResponse(JSON.stringify({ error: 'Access token is missing' }), { status: 400 });
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return new NextResponse(JSON.stringify(response.data), { status: 200 });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch data from Spotify API' }), { status: 500 });
  }
}
