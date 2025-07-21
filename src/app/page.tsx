"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './components/AuthProvider';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoadingAuth } = useAuth();

  useEffect(() => {
    if (!isLoadingAuth) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    }
  }, [isAuthenticated, isLoadingAuth, router]);

  return (
    <div className="flex flex-col items-center justify-center flex-grow">
      <h1 className="text-4xl font-bold text-gray-800 animate-pulse">Loading...</h1>
      <p className="mt-4 text-lg text-gray-600">Redirecting to the appropriate page.</p>
    </div>
  );
}