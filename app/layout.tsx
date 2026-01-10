import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/navigation/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'श्री राम शरणम् - साधना सत्संग प्रबंधन',
  description: 'साधना सत्संग के लिए साधकों का प्रबंधन प्रणाली',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi">
      <body className={inter.className}>
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
          <div className="w-full flex-none md:w-64">
            <Sidebar />
          </div>
          <main className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</main>
        </div>
      </body>
    </html>
  );
}