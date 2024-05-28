import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

async function fetchTopTracks(accessToken: string, offset: number) {
  const limit = 50;
  const response = await axios.get('https://api.spotify.com/v1/me/top/tracks?time_range=long_term', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      limit,
      offset,
    },
  });

  return response.data.items;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const accessToken = req.query.accessToken as string;

  if (!accessToken) {
    return res.status(400).json({ error: 'Missing access token' });
  }

  try {
    const firstBatch = await fetchTopTracks(accessToken, 0);
    const secondBatch = await fetchTopTracks(accessToken, 50);
    const thirdBatch = await fetchTopTracks(accessToken, 100);
    const fourthBatch = await fetchTopTracks(accessToken, 150);
    const top200Tracks = [...firstBatch, ...secondBatch, ...thirdBatch, ...fourthBatch];
    return res.status(200).json(top200Tracks);
  } catch (error: any) {
    console.error('Error fetching top tracks:', error);
    return res.status(error.response?.status || 500).json({ error: error.message });
  }
}
