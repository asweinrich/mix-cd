'use client';

import { SessionProvider } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
}

const TopTracksPage: React.FC = () => {
  return (
    <SessionProvider>
      <TopTracksContent />
    </SessionProvider>
  );
};

const TopTracksContent: React.FC = () => {
  const { data: session } = useSession();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [masterTracks, setMasterTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(session)
    if (session && session !== undefined) {
      axios
        .get('/api/spotify/top-tracks', {
          params: {
            accessToken: session.accessToken,
          },
        })
        .then((res) => setTracks(res.data))
        .catch((err) => {
          console.error('Error fetching top tracks:', err);
          setError(err.message);
        });
        

        // Fetch master user's playlist
      axios
        .get('/api/spotify/master-playlist', {
          params: {
            accessToken: session.accessToken,
          },
        })
        .then((res) => {
          setMasterTracks(res.data)
        })

        .catch((err) => {
          console.error('Error fetching master playlist:', err);
          setError(err.message);
        });


    } 

  }, [session]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-zinc-900 shadow-md rounded p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Your Top Tracks</h1>
        {error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
        <>
          <ul className="space-y-2">
            {tracks.map((track) => (
              <li key={track.id} className="flex items-center space-x-4">
                <img
                  src={track.album.images[0]?.url}
                  alt={`${track.name} album art`}
                  className="w-10 h-10 rounded"
                />
                <div>
                  <p className="text-lg font-semibold">{track.name}</p>
                  <p className="text-gray-600">by {track.artists.map((artist) => artist.name).join(', ')}</p>
                </div>
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-bold mt-48 mb-4 text-white">Master Playlist</h2>
            <ul className="space-y-2 mb-6">
              {masterTracks.map((track) => (
                <li key={track.track.id} className="flex items-center space-x-4">
                  <img
                    src={track.track.album.images[0]?.url}
                    alt={`${track.track.name} album art`}
                    className="w-10 h-10 rounded"
                  />
                  <div>
                    <p className="text-lg font-semibold text-white">{track.track.name}</p>
                    <p className="text-gray-400">by {track.track.artists.map((artist) => artist.name).join(', ')}</p>
                  </div>
                </li>
              ))}
          </ul>
        </>
        )}
      </div>
    </div>
  );
};

export default TopTracksPage;
