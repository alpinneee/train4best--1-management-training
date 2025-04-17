import './globals.css'
import { Inter } from "next/font/google";
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Train4Best",
  description: "Train4Best Application",
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
        {children}
      </body>
    </html>
  )
} 