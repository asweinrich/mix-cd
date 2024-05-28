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
  const [userTracks, setUserTracks] = useState<Track[]>([]);
  const [masterTracks, setMasterTracks] = useState<Track[]>([]);
  const [matchingTracks, setMatchingTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.accessToken) {
      // Fetch user top tracks
      axios
        .get('/api/spotify/top-tracks', {
          params: {
            accessToken: session.accessToken,
          },
        })
        .then((res) => setUserTracks(res.data))
        .catch((err) => {
          console.error('Error fetching top tracks:', err);
          setError(err.message);
        });

      // Fetch master user's playlist
      axios
        .get('/api/spotify/andrews-stuff', {
          params: {
            accessToken: session.accessToken,
          },
        })
        .then((res) => setMasterTracks(res.data))
        .catch((err) => {
          console.error('Error fetching master playlist:', err);
          setError(err.message);
        });
    } else {
      setError('No access token available');
    }
  }, [session]);

  useEffect(() => {
    // Compare userTracks and masterTracks to find matching tracks
    const matches = userTracks.filter((userTrack) =>
      masterTracks.some((masterTrack) => masterTrack.track.id === userTrack.id)
    );
    setMatchingTracks(matches);
  }, [userTracks, masterTracks]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-zinc-900 shadow-md rounded p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">Your Top Tracks</h1>
        {error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4 text-white">User Top Tracks</h2>
            <ul className="space-y-4 mb-6">
              {userTracks.map((track) => (
                <li key={track.id} className="flex items-center space-x-4">
                  <img
                    src={track.album.images[0]?.url}
                    alt={`${track.name} album art`}
                    className="w-16 h-16 rounded"
                  />
                  <div>
                    <p className="text-xl font-semibold text-white">{track.name}</p>
                    <p className="text-gray-400">by {track.artists.map((artist) => artist.name).join(', ')}</p>
                  </div>
                </li>
              ))}
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-white">Master Playlist</h2>
            <ul className="space-y-4 mb-6">
              {masterTracks.map((track) => (
                <li key={track.track.id} className="flex items-center space-x-4">
                  <img
                    src={track.track.album.images[0]?.url}
                    alt={`${track.track.name} album art`}
                    className="w-16 h-16 rounded"
                  />
                  <div>
                    <p className="text-xl font-semibold text-white">{track.track.name}</p>
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
