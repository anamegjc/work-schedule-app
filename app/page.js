'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      switch (session.user.role) {
        case 'ADMIN':
          router.push('/dashboard/admin');
          break;
        case 'MANAGER':
          router.push('/dashboard/manager');
          break;
        case 'STUDENT':
          router.push('/dashboard/student');
          break;
        default:
          router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [session, router]);

  return null;
}