import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const prisma = new PrismaClient();
        try {
          console.log('Login attempt for:', credentials?.email);

          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials');
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          console.log('User found:', !!user);

          if (!user) {
            console.log('User not found');
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log('Password valid:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('Invalid password');
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            studentId: user.studentId ?? undefined,
            office: user.office ?? undefined,
          };
        } catch (error) {
          console.error('Authorization error details:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
          });
          return null;
        } finally {
          await prisma.$disconnect();
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('JWT Callback - User:', user);
        return {
          ...token,
          id: user.id,
          role: user.role,
          studentId: user.studentId,
          office: user.office,
        };
      }
      return token;
    },
    async session({ session, token }) {
      console.log('Session Callback - Token:', token);
      if (session.user) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id,
            role: token.role,
            studentId: token.studentId,
            office: token.office,
          }
      
      };
    }
    return session;
  }

  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  //debug: true
});

export { handler as GET, handler as POST };