import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { TopBar } from '@/components/layout/TopBar';
import { Header } from '@/components/layout/Header';
import { MainNav } from '@/components/layout/MainNav';
import { SubNav } from '@/components/layout/SubNav';
import { Footer } from '@/components/layout/Footer';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '秀酷纹身之家 - 纹身信息网|纹身师招聘|纹身培训学校|纹身店转让信息',
  description: '纹身行业信息平台 - 提供纹身师招聘求职、纹身店转让、二手设备交易、纹身培训、纹身店大全、纹身师大全等信息服务',
  keywords: '纹身,纹身师招聘,纹身店转让,纹身培训,纹身信息,纹身师,纹身设备',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://www.sccoo.cn',
    siteName: '秀酷纹身之家',
    title: '秀酷纹身之家 - 纹身信息网',
    description: '纹身行业信息平台 - 提供纹身师招聘求职、纹身店转让、二手设备交易、纹身培训、纹身店大全、纹身师大全等信息服务',
  },
  twitter: {
    card: 'summary_large_image',
    title: '秀酷纹身之家 - 纹身信息网',
    description: '纹身行业信息平台 - 提供纹身师招聘求职、纹身店转让、二手设备交易、纹身培训、纹身店大全、纹身师大全等信息服务',
  },
  alternates: {
    types: {
      'application/rss+xml': [{ url: '/rss', title: '秀酷纹身之家 RSS' }],
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <TopBar />
        <Header />
        <MainNav />
        <SubNav />
        <main className="flex-1">
          <SessionProvider>{children}</SessionProvider>
        </main>
        <Toaster richColors />
        <Footer />
      </body>
    </html>
  );
}
