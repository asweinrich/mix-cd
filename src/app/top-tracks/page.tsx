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
  audio_features?: {
    acousticness: number;
    danceability: number;
    energy: number;
    instrumentalness: number;
    valence: number;
  };
}


interface MeanAudioFeatures {
  mean: {
    acousticness: number;
    danceability: number;
    energy: number;
    instrumentalness: number;
    valence: number;
  };
  stdDev: {
    acousticness: number;
    danceability: number;
    energy: number;
    instrumentalness: number;
    valence: number;
  };
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
  const [meanAudioFeatures, setMeanAudioFeatures] = useState<MeanAudioFeatures | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);


  useEffect(() => {
    if (session) {
      axios
        .get('/api/spotify/top-tracks', {
          params: {
            accessToken: session.accessToken,
          },
        })
        .then((res) => {
          setTracks(res.data)
          console.log(res.data)
        })
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
          console.log(res.data)
        })

        .catch((err) => {
          console.error('Error fetching master playlist:', err);
          setError(err.message);
        });

      
      
    }
  }, [session]);

  useEffect(() => {
    if (tracks.length > 0) {
      const meanFeatures = calculateMeanAudioFeatures(tracks);
      setMeanAudioFeatures(meanFeatures);
      setLoading(false);
    }
  }, [tracks])

  const calculateMeanAudioFeatures = (tracks: Track[]): MeanAudioFeatures => {
    
    //console.log('calculating from following data: ' + tracks)
    
    const totalFeatures = {
      acousticness: 0,
      danceability: 0,
      energy: 0,
      instrumentalness: 0,
      valence: 0,
    };

    const sumOfSquares = {
      acousticness: 0,
      danceability: 0,
      energy: 0,
      instrumentalness: 0,
      valence: 0,
    };

    tracks.forEach((track) => {
      if (track.audio_features) {
        totalFeatures.acousticness += track.audio_features.acousticness;
        totalFeatures.danceability += track.audio_features.danceability;
        totalFeatures.energy += track.audio_features.energy;
        totalFeatures.instrumentalness += track.audio_features.instrumentalness;
        totalFeatures.valence += track.audio_features.valence;
      }
    });

    const numTracks = tracks.length;

    const meanFeatures = {
      acousticness: totalFeatures.acousticness / numTracks,
      danceability: totalFeatures.danceability / numTracks,
      energy: totalFeatures.energy / numTracks,
      instrumentalness: totalFeatures.instrumentalness / numTracks,
      valence: totalFeatures.valence / numTracks,
    };

    tracks.forEach((track) => {
      if (track.audio_features) {
        sumOfSquares.acousticness += Math.pow(track.audio_features.acousticness - meanFeatures.acousticness, 2);
        sumOfSquares.danceability += Math.pow(track.audio_features.danceability - meanFeatures.danceability, 2);
        sumOfSquares.energy += Math.pow(track.audio_features.energy - meanFeatures.energy, 2);
        sumOfSquares.instrumentalness += Math.pow(track.audio_features.instrumentalness - meanFeatures.instrumentalness, 2);
        sumOfSquares.valence += Math.pow(track.audio_features.valence - meanFeatures.valence, 2);
      }
    });

    const stdDevFeatures = {
      acousticness: Math.sqrt(sumOfSquares.acousticness / numTracks),
      danceability: Math.sqrt(sumOfSquares.danceability / numTracks),
      energy: Math.sqrt(sumOfSquares.energy / numTracks),
      instrumentalness: Math.sqrt(sumOfSquares.instrumentalness / numTracks),
      valence: Math.sqrt(sumOfSquares.valence / numTracks),
    };

    return {
      mean: meanFeatures,
      stdDev: stdDevFeatures,
    };
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <div className="max-w-6xl w-full flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-lg font-semibold text-white mb-4">Getting your preferences</div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          ) : (
            meanAudioFeatures && (
            <div className="bg-zinc-900 shadow-md rounded p-8 mb-6">
              <h2 className="text-2xl font-bold mb-4 text-center md:text-left">Mean and Standard Deviation of Audio Features</h2>
              <ul className="space-y-4">
                {Object.entries(meanAudioFeatures.mean).map(([feature, meanValue]) => {
                  const stdDevValue = meanAudioFeatures.stdDev[feature as keyof MeanAudioFeatures["stdDev"]];
                  let min = 0, max = 1;

                  const meanPercentage = ((meanValue - min) / (max - min)) * 100;
                  const leftStdDev = meanValue - stdDevValue >= min ? meanValue - stdDevValue : min;
                  const rightStdDev = meanValue + stdDevValue <= max ? meanValue + stdDevValue : max;
                  const leftStdDevPercentage = ((leftStdDev - min) / (max - min)) * 100;
                  const stdDevWidth = ((rightStdDev - leftStdDev) / (max - min)) * 100;

                  return (
                    <li key={feature}>
                      <div className="flex justify-between items-center">
                        <span className="capitalize">{feature}</span>
                        <span>{meanValue.toFixed(2)}</span>
                      </div>
                      <div className="relative w-full h-4 bg-zinc-700 rounded">
                        {/* Mean value indicator */}
                        <div className="absolute top-0 h-full bg-teal-300 rounded" style={{ left: `${meanPercentage}%`, width: '3px' }}></div>
                        {/* Standard deviation visual representation */}
                        {stdDevWidth > 0 && (
                          <div className="absolute top-0 h-full bg-teal-300 opacity-30" style={{ left: `${leftStdDevPercentage}%`, width: `${stdDevWidth}%` }}></div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            )
          )}
          <div className="bg-zinc-900 shadow-md rounded p-8">
            <h1 className="text-3xl font-bold mb-6 text-center md:text-left">Your Top Tracks</h1>
            {error ? (
              <p className="text-red-500 text-center md:text-left">{error}</p>
            ) : (
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
            )}
          </div>
        </div>
        <div className="flex-1 bg-zinc-900 shadow-md rounded p-8">
          <h2 className="text-3xl font-bold mb-6 text-center md:text-left">Master Playlist</h2>
          <ul className="space-y-2">
            {masterTracks.map((track) => (
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
        </div>
      </div>
    </div>
  );
};

export default TopTracksPage;