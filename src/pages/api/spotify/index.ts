import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { accessToken } = req.query;

  if (!accessToken) {
    return res.status(400).json({ error: 'Missing access token' });
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50&offset=50', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    res.status(200).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
}
