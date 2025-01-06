import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
    studentId?: string;
    office?: string;
  }

  interface Session {
    user: User & {
      name: string;
      email: string;
    }
  }
}