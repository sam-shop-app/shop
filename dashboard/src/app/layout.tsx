import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Package } from "lucide-react";
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "商品管理后台",
  description: "一个用于管理商品的后台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} antialiased`}>
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto h-14 flex items-center">
              <Link href="/" className="flex items-center font-bold mr-6">
                <Package className="h-6 w-6 mr-2" />
                商品管理后台
              </Link>
              <nav className="flex items-center space-x-6 text-sm font-medium">
                <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
                  首页
                </Link>
                <Link href="/products" className="transition-colors hover:text-foreground/80 text-foreground">
                  商品
                </Link>
              </nav>
            </div>
          </header>
          
          <main className="flex-1">
            {children}
          </main>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
