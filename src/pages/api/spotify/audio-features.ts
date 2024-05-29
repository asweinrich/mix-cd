import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { accessToken, trackIds } = req.body;

  if (!accessToken || !trackIds) {
    return res.status(400).json({ error: 'Missing access token or track IDs' });
  }

  try {
    const fetchAudioFeature = async (id: string, delay: number) => {
      await new Promise(resolve => setTimeout(resolve, delay)); // Add delay to avoid rate limits
      const response = await axios.get(`https://api.spotify.com/v1/audio-features/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    };

    const delay = 100; // 100ms delay between requests
    const audioFeatures = [];
    for (let i = 0; i < trackIds.length; i++) {
      const feature = await fetchAudioFeature(trackIds[i], delay * i);
      audioFeatures.push(feature);
    }

    res.status(200).json({ audio_features: audioFeatures });
  } catch (error) {
    console.error('Error fetching audio features:', error);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
}
