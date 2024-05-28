import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const masterUserId = process.env.MASTER_USER_ID;
const masterPlaylistId = process.env.MASTER_PLAYLIST_ID;

async function fetchMasterPlaylist(accessToken: string) {
  const response = await axios.get(`https://api.spotify.com/v1/playlists/${masterPlaylistId}/tracks?fields=items%28track%28id%2Cname%2Cartists%28id%2C+name%2C+genres%29%2Chref%2Calbum%28name%2Chref%2C+images%29%29%29&offset=0`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
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
    const masterPlaylist = await fetchMasterPlaylist(accessToken);
    return res.status(200).json(masterPlaylist);
  } catch (error: any) {
    console.error('Error fetching master playlist:', error);
    return res.status(error.response?.status || 500).json({ error: error.message });
  }
}
