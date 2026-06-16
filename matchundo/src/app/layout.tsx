import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Button } from "@/components/ui/button";

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
        <header className="sticky top-0 z-50 w-full border-b border-zinc-900/60 bg-zinc-950/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-1.5 group">
                <span className="text-sm font-bold tracking-tight text-white transition-colors group-hover:text-zinc-300">
                  Match<span className="text-emerald-500 font-medium">Undo</span>
                </span>
              </Link>
              <nav className="hidden sm:flex items-center gap-5 text-xs font-semibold text-zinc-400">
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
            
            <div className="flex items-center gap-3">
              <Link href="/screenings" className="hidden sm:inline-block">
                <Button variant="default" size="sm" className="font-semibold">
                  Find Screenings
                </Button>
              </Link>
              
              {/* Mobile links */}
              <nav className="flex sm:hidden items-center gap-3.5 text-xs font-semibold text-zinc-400">
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
        <footer className="w-full border-t border-zinc-900 bg-zinc-950 py-5">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-tight text-white">
                Match<span className="text-emerald-500 font-medium">Undo</span>
              </span>
              <span className="text-zinc-800 text-[10px]">|</span>
              <p className="text-[10px] text-zinc-500 font-medium">
                Kerala Watch Party Directory
              </p>
            </div>
            <p className="text-[10px] text-zinc-600 font-medium">
              &copy; {new Date().getFullYear()} MatchUndo.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
