import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './components/AuthProvider';
import MessageModal from './components/MessageModal';
import Image from 'next/image';
import background from '../assets/img/bground.png';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Universal Shipping Tracker',
  description: 'Track your shipments from multiple carriers in one place.',
  icons: {
    icon: '/tracking.png', 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.className} min-h-screen w-full flex flex-col relative bg-transparent`}
      >
        <div className="absolute inset-0 z-0 overflow-hidden h-full w-full">
          <Image
            src={background}
            alt="Background Image"
            fill
            style={{ objectFit: 'cover' }}
            quality={100}
            priority
          />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen w-full">
          <AuthProvider>
            {children}
            <MessageModal />
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
