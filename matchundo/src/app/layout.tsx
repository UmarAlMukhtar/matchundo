import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { checkAdminAuth } from "@/app/actions";
import { APP_URL } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "MatchUndo - Sports Watch Parties & Match Screenings",
  description: "Discover live sports screenings, watch parties, and community match events across Kerala.",
  alternates: {
    canonical: "./",
  },
  verification: {
    google: "hHEIeBNoTCe9P6swaZiwadSb2V8XQBK-ecSI3_aXyCM",
  },
  openGraph: {
    title: "MatchUndo - Sports Watch Parties & Match Screenings",
    description: "Discover live sports screenings, watch parties, and community match events across Kerala.",
    url: APP_URL,
    siteName: "MatchUndo",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MatchUndo - Sports Watch Parties & Match Screenings",
    description: "Discover live sports screenings, watch parties, and community match events across Kerala.",
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAdmin = await checkAdminAuth();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 selection:bg-zinc-800 selection:text-zinc-100">
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          strategy="afterInteractive"
          data-cf-beacon='{"token":"2946b9b6e15d4f7491f307f4b18ae756"}'
        />
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
                <Link href="/venues" className="hover:text-zinc-200 transition-colors">
                  Venues
                </Link>
                {isAdmin && (
                  <>
                    <Link href="/admin/submissions" className="hover:text-amber-400 transition-colors text-amber-500">
                      Submissions
                    </Link>
                    <Link href="/admin/analytics" className="hover:text-zinc-200 transition-colors text-zinc-450">
                      Analytics
                    </Link>
                  </>
                )}
                <Link href="/admin" className="hover:text-zinc-200 transition-colors">
                  Admin
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/submit" className="hidden sm:inline-block">
                <Button variant="default" size="sm" className="font-semibold bg-zinc-100 text-zinc-950 hover:bg-zinc-200">
                  Submit Watch
                </Button>
              </Link>
              
              <nav className="flex sm:hidden items-center gap-3.5 text-xs font-semibold text-zinc-400">
                <Link href="/screenings" className="hover:text-zinc-200 transition-colors">
                  Listings
                </Link>
                <Link href="/venues" className="hover:text-zinc-200 transition-colors">
                  Venues
                </Link>
                {isAdmin && (
                  <>
                    <Link href="/admin/submissions" className="hover:text-zinc-200 transition-colors text-amber-500">
                      Submissions
                    </Link>
                    <Link href="/admin/analytics" className="hover:text-zinc-200 transition-colors text-zinc-450">
                      Analytics
                    </Link>
                  </>
                )}
                <Link href="/submit" className="hover:text-zinc-200 transition-colors">
                  Submit
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
        <footer className="w-full border-t border-zinc-900 bg-zinc-950 py-8 mt-auto">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
            
            {/* Top row: Brand & Legal Links */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-900/60 pb-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-tight text-white">
                  Match<span className="text-emerald-500 font-medium">Undo</span>
                </span>
                <span className="text-zinc-800 text-[10px]">|</span>
                <p className="text-[10px] text-zinc-550 font-medium">
                  Kerala Sports Screenings Directory
                </p>
              </div>
              
              <nav className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-zinc-500 font-semibold">
                <Link href="/privacy" className="hover:text-zinc-350 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-zinc-350 transition-colors">
                  Terms & Conditions
                </Link>
                <Link href="/disclaimer" className="hover:text-zinc-350 transition-colors">
                  Disclaimer
                </Link>
                <Link href="/contact" className="hover:text-zinc-350 transition-colors">
                  Contact
                </Link>
              </nav>
            </div>

            {/* Bottom Row: Disclaimers & Copyright */}
            <div className="flex flex-col md:flex-row justify-between gap-4 text-[9px] text-zinc-650 leading-relaxed">
              <div className="max-w-2xl space-y-1 text-left">
                <p>
                  MatchUndo is an independent community platform for discovering public sports screenings and watch parties. MatchUndo is not affiliated with, endorsed by, or sponsored by FIFA, the FIFA World Cup, IPL, ISL, UEFA, clubs, leagues, teams, or governing bodies.
                </p>
                <p>
                  Information on MatchUndo may be community-submitted. Please verify event details with venues before attending.
                </p>
              </div>
              <p className="shrink-0 text-left md:text-right mt-1 md:mt-0 font-medium">
                &copy; {new Date().getFullYear()} MatchUndo.
              </p>
            </div>

          </div>
        </footer>
      </body>
    </html>
  );
}
