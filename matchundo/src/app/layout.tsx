import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MatchUndo - World Cup Screenings Kerala",
  description: "Discover public sports match screenings in Kerala.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 selection:bg-zinc-800 selection:text-zinc-100">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-zinc-950/70 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-base font-semibold tracking-tight text-white transition-colors hover:text-zinc-350">
                  Match<span className="text-emerald-500">Undo</span>
                </span>
              </Link>
              <nav className="hidden sm:flex items-center gap-6 text-sm text-zinc-450">
                <Link href="/" className="hover:text-zinc-200 transition-colors">
                  Home
                </Link>
                <Link href="/screenings" className="hover:text-zinc-200 transition-colors">
                  Screenings
                </Link>
                <Link href="/admin" className="hover:text-zinc-200 transition-colors">
                  Admin
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href="/screenings"
                className="inline-flex h-8 items-center justify-center rounded-md bg-zinc-100 px-3 text-xs font-semibold text-zinc-900 hover:bg-zinc-200 transition-colors"
              >
                Find Screenings
              </Link>
              
              {/* Mobile links */}
              <nav className="flex sm:hidden items-center gap-3 text-xs text-zinc-450">
                <Link href="/screenings" className="hover:text-zinc-200 transition-colors">
                  Listings
                </Link>
                <Link href="/admin" className="hover:text-zinc-200 transition-colors">
                  Admin
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col w-full">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-zinc-900 bg-zinc-950 py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-white">
                Match<span className="text-emerald-500">Undo</span>
              </span>
              <span className="text-zinc-800 text-[10px]">|</span>
              <p className="text-xs text-zinc-500">
                Kerala Football Screening Discovery
              </p>
            </div>
            <p className="text-[11px] text-zinc-650">
              &copy; {new Date().getFullYear()} MatchUndo. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
