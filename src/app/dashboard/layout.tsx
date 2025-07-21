'use client';

import Navbar from './../components/Navbar';
import { useAuth } from './../components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.push('/auth/login'); 
    }
  }, [isAuthenticated, isLoadingAuth, router]);

  if (isLoadingAuth || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold text-gray-800 animate-pulse">Loading...</h1>
        <p className="mt-4 text-lg text-gray-600">Authentication in progress...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 bg-white bg-opacity-80 rounded-lg shadow-lg my-4">
        {children}
      </main>
    </div>
  );
}
