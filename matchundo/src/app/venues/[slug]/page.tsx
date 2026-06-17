import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { APP_URL } from "@/lib/config";
import { getVenuesFromScreenings } from "@/lib/venue";
import { trackPageView } from "@/lib/analytics";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, Clock, ExternalLink, Map as MapIcon, Play, History } from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate dynamic metadata for the venue
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const screenings = await db.getApprovedScreenings();
  const venues = getVenuesFromScreenings(screenings);
  const venue = venues.find(v => v.slug === slug);

  if (!venue) {
    return {
      title: "Venue Not Found | MatchUndo",
    };
  }

  const title = `${venue.venueName} - Watch Screenings in ${venue.city} | MatchUndo`;
  const description = `Upcoming and past sports match screenings hosted at ${venue.venueName} in ${venue.city}, Kerala. Get directions and view schedules.`;
  const canonicalUrl = `${APP_URL}/venues/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    }
  };
}

function formatScreeningDateTime(isoString: string) {
  try {
    const d = new Date(isoString);
    const dateStr = d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    const timeStr = d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return { dateStr, timeStr };
  } catch {
    return { dateStr: "TBD", timeStr: "TBD" };
  }
}

export default async function VenueDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const screenings = await db.getApprovedScreenings();
  const venues = getVenuesFromScreenings(screenings);
  const venue = venues.find(v => v.slug === slug);

  if (!venue) {
    notFound();
  }

  // Track page view
  trackPageView(`/venues/${slug}`);

  const venueName = venue.venueName;
  const city = venue.city;
  const address = venue.address;
  const googleMapsLink = venue.googleMapsLink;

  // Filter screenings belonging specifically to this physical location
  const venueScreenings = screenings.filter(
    s => s.venue_name.trim().toLowerCase() === venueName.toLowerCase() &&
         s.city.trim().toLowerCase() === city.toLowerCase() &&
         s.address.trim().toLowerCase() === address.toLowerCase()
  );

  // Split into upcoming and past screenings
  const now = new Date();
  const upcomingScreenings = venueScreenings
    .filter(s => new Date(s.screening_datetime) >= now)
    .sort((a, b) => new Date(a.screening_datetime).getTime() - new Date(b.screening_datetime).getTime());
  
  const pastScreenings = venueScreenings
    .filter(s => new Date(s.screening_datetime) < now)
    .sort((a, b) => new Date(b.screening_datetime).getTime() - new Date(a.screening_datetime).getTime());

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col">
      {/* Back navigation */}
      <div className="mb-6">
        <Link
          href="/venues"
          className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-350 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Back to venues
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Venue Details Card */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <Card className="border-zinc-900 bg-zinc-950 p-5 shadow-sm">
            <span className="inline-flex items-center rounded bg-zinc-900 px-2 py-0.5 text-[9px] font-bold text-zinc-400 border border-zinc-900 mb-3">
              {city}
            </span>
            <CardTitle className="text-sm font-bold text-white mb-2 leading-tight">
              {venueName}
            </CardTitle>
            <p className="text-[11px] text-zinc-550 mb-4 flex items-start gap-1.5 leading-relaxed">
              <MapPin className="h-3.5 w-3.5 text-zinc-650 shrink-0 mt-0.5" />
              <span>{address}</span>
            </p>

            {googleMapsLink ? (
              <a
                href={googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-semibold border-zinc-900 hover:border-zinc-800 flex items-center justify-center gap-1.5 h-8.5"
                >
                  <MapIcon className="h-3.5 w-3.5 text-zinc-455" /> Get Directions <ExternalLink className="h-2.5 w-2.5 text-zinc-600" />
                </Button>
              </a>
            ) : (
              <Button
                disabled
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold border-zinc-900/60 text-zinc-700 cursor-not-allowed h-8.5"
              >
                <MapIcon className="h-3.5 w-3.5 text-zinc-800" /> Directions Unavailable
              </Button>
            )}
          </Card>
        </div>

        {/* Right Column: Listings schedules */}
        <div className="md:col-span-8 flex flex-col gap-8">
          
          {/* Upcoming Match Screenings */}
          <div>
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3 mb-4">
              <Play className="h-4 w-4 text-emerald-500 fill-emerald-500/20" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Upcoming Screenings ({upcomingScreenings.length})
              </h2>
            </div>

            {upcomingScreenings.length > 0 ? (
              <div className="space-y-3">
                {upcomingScreenings.map((screening) => {
                  const { dateStr, timeStr } = formatScreeningDateTime(screening.screening_datetime);
                  return (
                    <Card key={screening.id} className="border-zinc-900 hover:border-zinc-850 transition-colors bg-zinc-950/40 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-xs font-bold text-white line-clamp-1">{screening.match_name}</h3>
                          
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {screening.sport && (
                              <span className="inline-flex items-center rounded bg-emerald-950/20 border border-emerald-900/15 px-1.5 py-0.5 text-[8px] font-bold text-emerald-400">
                                {screening.sport}
                              </span>
                            )}
                            {screening.competition && (
                              <span className="inline-flex items-center rounded bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 text-[8px] font-bold text-zinc-400">
                                {screening.competition}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-[10px] text-zinc-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-zinc-650" /> {dateStr}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-zinc-650" /> {timeStr}
                            </span>
                          </div>
                          {screening.description && (
                            <p className="text-[10px] text-zinc-550 mt-2 line-clamp-2 leading-relaxed">
                              {screening.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="shrink-0">
                          <Link href={`/screenings/${screening.id}`}>
                            <Button size="sm" variant="outline" className="text-[10px] font-bold h-7.5 border-zinc-900">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center rounded-lg border border-zinc-900/60 bg-zinc-950/20">
                <p className="text-zinc-550 text-[11px]">No upcoming watch screenings listed for this venue.</p>
              </div>
            )}
          </div>

          {/* Past Match Screenings */}
          <div>
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3 mb-4">
              <History className="h-4 w-4 text-zinc-500" />
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Past Screenings ({pastScreenings.length})
              </h2>
            </div>

            {pastScreenings.length > 0 ? (
              <div className="space-y-2 opacity-65 hover:opacity-100 transition-opacity">
                {pastScreenings.map((screening) => {
                  const { dateStr, timeStr } = formatScreeningDateTime(screening.screening_datetime);
                  return (
                    <Card key={screening.id} className="border-zinc-900 bg-zinc-950/20 p-3">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-xs font-semibold text-zinc-355 line-clamp-1">{screening.match_name}</h3>
                          
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {screening.sport && (
                              <span className="inline-flex items-center rounded bg-emerald-950/20 border border-emerald-900/10 px-1.5 py-0.5 text-[8px] font-bold text-emerald-450">
                                {screening.sport}
                              </span>
                            )}
                            {screening.competition && (
                              <span className="inline-flex items-center rounded bg-zinc-900 border border-zinc-900 px-1.5 py-0.5 text-[8px] font-bold text-zinc-500">
                                {screening.competition}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[9px] text-zinc-550 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-zinc-700" /> {dateStr}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-zinc-700" /> {timeStr}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <span className="text-[9px] font-bold text-zinc-650 bg-zinc-900 border border-zinc-900 px-2 py-0.5 rounded">
                            Ended
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center rounded-lg border border-zinc-900/40 bg-zinc-950/10">
                <p className="text-zinc-650 text-[11px]">No past screenings recorded.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
