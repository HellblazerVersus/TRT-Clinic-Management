import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TRT Clinic — Practice Management',
  description: 'Hormone optimization clinic management: protocol adherence, renewal logistics, DEA Schedule III tracking.',
  keywords: ['TRT', 'hormone optimization', 'clinic management', 'practice management'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-surface-0 text-white antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
