'use client';

import { SessionProvider } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
}

export default function TopTracks() {
  return (
    <SessionProvider>
      <TopTracksContent />
    </SessionProvider>
  );
}

const TopTracksContent: React.FC = () => {
  const { data: session } = useSession();
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    if (session) {
      axios
        .get('/api/spotify', {
          params: {
            accessToken: session.accessToken,
          },
        })
        .then((res) => setTracks(res.data.items))
        .catch((err) => console.error('Error fetching top tracks:', err));
    }
  }, [session]);

  return (
    <div>
      <h1>Your Top Tracks</h1>
      {session ? (
        <ul>
          {tracks.map((track) => (
            <li key={track.id}>
              {track.name} by {track.artists.map((artist) => artist.name).join(', ')}
            </li>
          ))}
        </ul>
      ) : (
        <p>Please sign in to see your top tracks.</p>
      )}
    </div>
  );
};
