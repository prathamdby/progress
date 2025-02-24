import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://progress-eosin.vercel.app"),
  title: "Progress - Task Manager",
  description:
    "A modern task manager to help you track and improve your daily progress. Track accomplishments, manage tasks, and collaborate with your team efficiently.",
  keywords: "task management, daily progress, team collaboration, productivity",
  authors: [{ name: "Pratham Dubey" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Progress",
  },
  openGraph: {
    title: "Progress - Task Manager",
    description:
      "A modern task manager to help you track and improve your daily progress. Track accomplishments, manage tasks, and collaborate with your team efficiently.",
    url: "https://progress-eosin.vercel.app",
    siteName: "Progress",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://progress-eosin.vercel.app/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Progress App Icon",
      },
      {
        url: "https://progress-eosin.vercel.app/icons/icon-192x192.png",
        width: 192,
        height: 192,
        alt: "Progress App Icon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Progress - Task Manager",
    description:
      "A modern task manager to help you track and improve your daily progress. Track accomplishments, manage tasks, and collaborate with your team efficiently.",
    images: ["https://progress-eosin.vercel.app/icons/icon-512x512.png"],
  },
  icons: {
    icon: [
      { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192x192.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${roboto.variable} min-h-screen bg-gradient-to-b from-black via-blue-950/80 to-black font-sans text-white antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
