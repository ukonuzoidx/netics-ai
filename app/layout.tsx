import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Chat App",
  description: "A modern chat application built with Next.js and Convex",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexClientProvider>
      <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
        <head>
          <meta name="color-scheme" content="dark" />
          <meta name="theme-color" content="#0a0a0a" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-950 text-neutral-50`}
          style={{ backgroundColor: '#0a0a0a', color: '#fafafa' }}
        >
          {children}
        </body>
      </html>
    </ConvexClientProvider>
  );
}
