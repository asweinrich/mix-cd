import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
  audio_features?: {
    acousticness: number;
    danceability: number;
    energy: number;
    instrumentalness: number;
    valence: number;
    tempo: number;
  };
}

async function fetchTopTracks(accessToken: string, offset: number = 0): Promise<Track[]> {
  const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      time_range: 'long_term',
      limit: 50,
      offset,
    },
  });

  return response.data.items;
}

async function fetchAudioFeatures(accessToken: string, trackIds: string[]) {
  const response = await axios.get('https://api.spotify.com/v1/audio-features', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      ids: trackIds.join(','),
    },
  });
  return response.data.audio_features;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const accessToken = req.query.accessToken as string;

  if (!accessToken) {
    return res.status(400).json({ error: 'Missing access token' });
  }

  try {
    let allTracks: Track[] = [];
    const firstBatch = await fetchTopTracks(accessToken, 0);
    const secondBatch = await fetchTopTracks(accessToken, 50);
    allTracks = [...firstBatch, ...secondBatch];

    // Fetch audio features for tracks in batches of 100
    for (let i = 0; i < allTracks.length; i += 100) {
      const trackIds = allTracks.slice(i, i + 100).map((item) => item.id);
      const features = await fetchAudioFeatures(accessToken, trackIds);

      // Merge audio features into the track objects
      for (let j = 0; j < features.length; j++) {
        allTracks[i + j].audio_features = features[j];
      }
    }

    // Map and return the final array with tracks including their audio features
    const responseData = allTracks.map((item) => item);

    return res.status(200).json(responseData);
  } catch (error: any) {
    console.error('Error fetching top tracks or audio features:', error);
    return res.status(error.response?.status || 500).json({ error: error.message });
  }
}
