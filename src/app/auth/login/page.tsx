'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api';
import { useAuth } from './../../components/AuthProvider';
import Link from 'next/link';
import { showMessage } from './../../components/MessageModal';
import Image from 'next/image'; 
import trackingImage from './../../../assets/img/tracking.png'; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginUser({ email, password });
      login(response.token!, response.userId!, response.userName!);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login failed:', error);
      showMessage(error.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 from-blue-100 to-purple-100">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-3xl shadow-2xl transform transition-all duration-300 hover:scale-105">
        <div className="flex flex-col items-center">
          <Image
            src={trackingImage} 
            alt="Tracking System Image"
            width={100} 
            height={120} 
            className="w-auto h-auto" 
          />
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900 drop-shadow-sm">
            Sign In
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to track your shipments.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email Address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-t-md relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-base transition duration-150 ease-in-out"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-b-md relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-base transition duration-150 ease-in-out"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
        <div className="text-center">
          <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
            Don't have an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
}
