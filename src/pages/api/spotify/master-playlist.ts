import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const masterPlaylistId = process.env.MASTER_PLAYLIST_ID;

async function fetchMasterPlaylist(accessToken: string, offset: number = 0) {
  const response = await axios.get(`https://api.spotify.com/v1/playlists/${masterPlaylistId}/tracks`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
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
    let offset = 0;

    // Fetch master playlist tracks in batches of 50
    while (true) {
      const tracks = await fetchMasterPlaylist(accessToken, offset);
      allTracks = allTracks.concat(tracks);
      if (tracks.length < 50) break;
      offset += 50;
    }

    // Fetch audio features for tracks in batches of 100
    for (let i = 0; i < allTracks.length; i += 100) {
      const trackIds = allTracks.slice(i, i + 100).map((item: any) => item.track.id);
      const features = await fetchAudioFeatures(accessToken, trackIds);

      // Merge audio features into the track objects
      for (let j = 0; j < features.length; j++) {
        allTracks[i + j].track.audio_features = features[j];
      }
    }

    // Map and return the final array with tracks including their audio features
    const responseData = allTracks.map((item: any) => item.track);

    return res.status(200).json(responseData);
  } catch (error: any) {
    console.error('Error fetching master playlist or audio features:', error);
    return res.status(error.response?.status || 500).json({ error: error.message });
  }
}
