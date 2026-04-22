import SocketProvider from "@/providers/SocketProvider";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "react-hot-toast";
import "./globals.css";

import StoreProvider from "./StoreProvider";
import Providers from "./providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "TKBoss777 -Agent",
  description: "Bet on your favorite games with TKBoss777",
  openGraph: {
    title: "TKBoss777 - Bet",
    description: "Bet on your favorite games with TKBoss777",
    url: "https://tkboss777.com",
    siteName: "TKBoss777",
    images: [
      {
        url: "https://tkboss777.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "TKBoss777 - Bet",
      },
    ],
    type: "website",
    locale: "en_US",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <StoreProvider>
          <SocketProvider>
            <div style={{ background: "#0B0D12" }}>
              <Providers>{children}</Providers>
            </div>
            <Toaster />
          </SocketProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
