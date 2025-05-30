import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: '일정 앱',
  description: '일정 관리 앱',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-100">
        <Providers>
          <main className="w-full max-w-[500px] mx-auto bg-white min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
