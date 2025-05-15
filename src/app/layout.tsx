import './globals.css'
import { Inter } from "next/font/google";
import Script from 'next/script';
import { NotificationProvider } from '@/context/NotificationContext';
import Notification from '@/components/common/Notification';
import SessionProvider from '@/components/providers/SessionProvider';
import { Toaster } from "react-hot-toast";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Train4Best",
  description: "Management Training Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-signin-client_id"
          content="913107858333-8csadaquuajoeb3pf7hu2l223ia4u6od.apps.googleusercontent.com"
        />
      </head>
      <body className={`${inter.className} bg-gray-50`}>
        <Script src="https://apis.google.com/js/platform.js" strategy="afterInteractive" />
        <SessionProvider>
          <NotificationProvider>
            {children}
            <Notification />
          </NotificationProvider>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
} 