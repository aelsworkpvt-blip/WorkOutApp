import type { Metadata, Viewport } from "next";
import { DM_Sans, Sora } from "next/font/google";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#111622",
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  applicationName: "Forge Motion",
  title: {
    default: "Forge Motion",
    template: "%s | Forge Motion",
  },
  description:
    "Adaptive workout memory, smart progression, measurements, macros, and weekly digest in one mobile-first training app.",
  manifest: "/manifest.webmanifest",
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Forge Motion",
  },
  icons: {
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${dmSans.variable} antialiased`}>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
