import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
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
        className={`${roboto.variable} font-sans antialiased min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white`}
      >
        {children}
      </body>
    </html>
  );
}
