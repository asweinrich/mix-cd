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

interface MasterTrack {
  track: Track;
}

interface AudioFeatures {
  id: string;
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
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
  const [masterTracks, setMasterTracks] = useState<MasterTrack[]>([]);
  const [userAudioFeatures, setUserAudioFeatures] = useState<AudioFeatures[]>([]);
  const [masterAudioFeatures, setMasterAudioFeatures] = useState<AudioFeatures[]>([]);
  const [matchingTracks, setMatchingTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session && session.accessToken) {
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

      axios
        .get('/api/spotify/master-playlist', {
          params: {
            accessToken: session.accessToken,
          },
        })
        .then((res) => {
          setMasterTracks(res.data);
          console.log(res.data);
        })
        .catch((err) => {
          console.error('Error fetching master playlist:', err);
          setError(err.message);
        });
    } else {
      console.log('No access token available');
      setError('No access token available');
    }
  }, [session]);

  useEffect(() => {
    if (userTracks.length > 0 && masterTracks.length > 0) {
      const userTrackIds = userTracks.map(track => track.id);
      const masterTrackIds = masterTracks.map(track => track.track.id);

      axios
        .post('/api/spotify/audio-features', {
          accessToken: session?.accessToken,
          trackIds: userTrackIds,
        })
        .then((res) => setUserAudioFeatures(res.data.audio_features))
        .catch((err) => {
          console.error('Error fetching user audio features:', err);
          setError(err.message);
        });

      axios
        .post('/api/spotify/audio-features', {
          accessToken: session?.accessToken,
          trackIds: masterTrackIds,
        })
        .then((res) => setMasterAudioFeatures(res.data.audio_features))
        .catch((err) => {
          console.error('Error fetching master audio features:', err);
          setError(err.message);
        });
    }
  }, [userTracks, masterTracks, session]);

  useEffect(() => {
    if (userAudioFeatures.length > 0 && masterAudioFeatures.length > 0) {
      const matches = masterAudioFeatures.filter((masterTrack) =>
        userAudioFeatures.some((userTrack) =>
          Math.abs(userTrack.danceability - masterTrack.danceability) < 0.1 &&
          Math.abs(userTrack.energy - masterTrack.energy) < 0.1
        )
      ).map(match => {
        const foundTrack = masterTracks.find(track => track.track.id === match.id);
        return foundTrack ? foundTrack.track : null;
      }).filter(track => track !== null) as Track[];

      setMatchingTracks(matches);
    }
  }, [userAudioFeatures, masterAudioFeatures, masterTracks]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-zinc-900 shadow-md rounded p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Your Top Tracks</h1>
        {error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <>
            <ul className="space-y-2">
              {userTracks.map((track) => (
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

            <h2 className="text-2xl font-bold mt-12 mb-4 text-white">Matching Tracks</h2>
            <ul className="space-y-2 mb-6">
              {matchingTracks.map((track) => (
                <li key={track.id} className="flex items-center space-x-4">
                  <img
                    src={track.album.images[0]?.url}
                    alt={`${track.name} album art`}
                    className="w-10 h-10 rounded"
                  />
                  <div>
                    <p className="text-lg font-semibold text-white">{track.name}</p>
                    <p className="text-gray-400">by {track.artists.map((artist) => artist.name).join(', ')}</p>
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
