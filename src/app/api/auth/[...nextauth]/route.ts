import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: 'google-demo',
      name: 'Google 계정',
      credentials: {},
      async authorize() {
        return {
          id: 'user-demo-1',
          name: '대표님 (HBOS Master)',
          email: 'mhr7028@gmail.com',
          image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: 'my-friends-secret-key-2026',
});

export { handler as GET, handler as POST };
