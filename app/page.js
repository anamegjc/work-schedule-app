'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.push('/login');
      return;
    }

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
  }, [session, status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return null;
}