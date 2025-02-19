import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
  title: "Daily Progress Tracker | Stay Productive",
  description:
    "Track your daily accomplishments, manage tasks, and collaborate with your team efficiently. A modern solution for daily stand-ups and progress tracking.",
  keywords: "task management, daily updates, team collaboration, productivity",
  authors: [{ name: "Progress Tracker Team" }],
  openGraph: {
    title: "Daily Progress Tracker",
    description: "Streamline your daily updates and team collaboration",
    type: "website",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white`}
      >
        {children}
      </body>
    </html>
  );
}
