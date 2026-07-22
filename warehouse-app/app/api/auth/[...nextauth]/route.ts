import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { signToken } from '@/lib/auth';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return true;
      await connectDB();
      const existing = await User.findOne({ email: user.email!.toLowerCase() });
      if (!existing) {
        await User.create({
          name: user.name,
          email: user.email!.toLowerCase(),
          password: `google_${account.providerAccountId}`,
        });
      }
      return true;
    },
    async jwt({ token, account, user }) {
      if (account?.provider === 'google' && user?.email) {
        await connectDB();
        const dbUser = await User.findOne({ email: user.email.toLowerCase() });
        if (dbUser) {
          token.appToken = signToken(String(dbUser._id));
          token.dbUser = { id: String(dbUser._id), name: dbUser.name, email: dbUser.email };
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.appToken) {
        (session as typeof session & { appToken: string }).appToken = token.appToken as string;
        (session as typeof session & { dbUser: unknown }).dbUser = token.dbUser;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/signin' },
});

export { handler as GET, handler as POST };
