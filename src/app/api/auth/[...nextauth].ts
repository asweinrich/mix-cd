import NextAuth from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';

const options = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: 'https://accounts.spotify.com/authorize?scope=user-read-email,playlist-modify-public,playlist-modify-private,user-top-read',
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
};

export default NextAuth(options);
