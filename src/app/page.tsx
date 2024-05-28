'use client';

import { SessionProvider } from 'next-auth/react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  return (
    <SessionProvider>
      <HomeContent />
    </SessionProvider>
  );
}

const HomeContent: React.FC = () => {
  const { data: session } = useSession();

  return (
    <div>
      <h1>Welcome to Your Spotify Mixtape App</h1>
      {session ? (
        <>
          <p>Signed in as {session.user?.email}</p>
          <button onClick={() => signOut()}>Sign out</button>
          <Link href="/top-tracks">
            <a>See your top tracks</a>
          </Link>
        </>
      ) : (
        <>
          <p>Not signed in</p>
          <button onClick={() => signIn('spotify')}>Sign in with Spotify</button>
        </>
      )}
    </div>
  );
};
