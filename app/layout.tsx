import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import { Toaster } from 'sonner';

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
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        
        {/* Toast Notifications */}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}