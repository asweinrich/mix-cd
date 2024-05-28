'use client';

import { SessionProvider } from 'next-auth/react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';

const Home: React.FC = () => {
  return (
    <SessionProvider>
      <HomeContent />
    </SessionProvider>
  );
};

const HomeContent: React.FC = () => {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-zinc-800 shadow-md rounded p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome to Your Spotify Mixtape App</h1>
        {session ? (
          <div className="text-center">
            <p className="text-lg mb-4">Signed in as {session.user?.email}</p>
            <button
              onClick={() => signOut()}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded mb-4"
            >
              Sign out
            </button>
            <Link href="/top-tracks">
                See your top tracks
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg mb-4">Not signed in</p>
            <button
              onClick={() => signIn('spotify')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            >
              Sign in with Spotify
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
