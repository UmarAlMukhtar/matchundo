import Link from "next/link";
import { db } from "@/lib/db";
import { APP_URL } from "@/lib/config";
import { notFound } from "next/navigation";
import { MapPin, Calendar, Clock, ArrowLeft, ExternalLink, Map as MapIcon, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { checkAdminAuth } from "@/app/actions";
import { trackPageView, trackEvent } from "@/lib/analytics";
import { getVenueSlugMap, getVenueSlugKey, slugify } from "@/lib/venue";
import { ReportButton } from "@/components/ReportButton";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Dynamic SEO metadata generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const screening = await db.getScreeningById(id);
  const isAdmin = await checkAdminAuth();
  
  if (!screening || (screening.status !== 'approved' && !isAdmin)) {
    return {
      title: "Screening Not Found | MatchUndo",
    };
  }

  const title = `${screening.match_name} | MatchUndo`;
  const description = `Watch ${screening.match_name} at ${screening.venue_name}, ${screening.city}.`;
  const canonicalUrl = `${APP_URL}/screenings/${id}`;

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
      images: screening.poster_image_url ? [{ url: screening.poster_image_url }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: screening.poster_image_url ? [screening.poster_image_url] : [],
    }
  };
}

import { formatScreeningDate, formatShortTime } from "@/lib/date";

function formatScreeningDateTime(isoString: string) {
  try {
    const dateStr = formatScreeningDate(isoString, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    const timeStr = formatShortTime(isoString);
    return { dateStr, timeStr };
  } catch {
    return { dateStr: "TBD", timeStr: "TBD" };
  }
}

export default async function ScreeningDetailPage({ params }: PageProps) {
  const { id } = await params;
  const screening = await db.getScreeningById(id);
  const isAdmin = await checkAdminAuth();

  if (!screening || (screening.status !== 'approved' && !isAdmin)) {
    notFound();
  }

  // Track page views and detail clicks
  trackPageView(`/screenings/${id}`);
  trackEvent("screening_view", { id, match: screening.match_name, venue: screening.venue_name });

  const allApproved = await db.getApprovedScreenings();
  const slugMap = getVenueSlugMap(allApproved);
  const venueSlug = slugMap.get(getVenueSlugKey(screening.venue_name, screening.city, screening.address)) || slugify(screening.venue_name);

  const { dateStr, timeStr } = formatScreeningDateTime(screening.screening_datetime);

  // Structured Data (JSON-LD Event schema)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": screening.match_name,
    "startDate": screening.screening_datetime,
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled",
    "location": {
      "@type": "Place",
      "name": screening.venue_name,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": screening.address,
        "addressLocality": screening.city,
        "addressRegion": "Kerala",
        "addressCountry": "IN"
      }
    },
    "image": screening.poster_image_url || undefined,
    "description": screening.description || `Public screening watch party for ${screening.match_name}`
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col">
      {/* Insert JSON-LD structured schema block */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back Link */}
      <div className="mb-6">
        <Link
          href="/screenings"
          className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-350 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Back to screenings
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full items-start">
        
        {/* Left Column: Poster Image */}
        <div className="md:col-span-5 w-full">
          <Card className="overflow-hidden border-zinc-900 shadow-sm">
            {screening.poster_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={screening.poster_image_url}
                alt={screening.match_name}
                className="w-full h-auto object-cover aspect-[3/4]"
              />
            ) : (
              /* Notion-style large poster placeholder */
              <div className="w-full aspect-[3/4] bg-zinc-950 p-6 flex flex-col justify-between items-start text-left relative">
                <div>
                  <span className="inline-flex items-center rounded-md bg-zinc-900 px-2 py-0.5 text-[9px] font-bold text-zinc-500 border border-zinc-900 uppercase tracking-widest">
                    {screening.sport || "Live Screening"}
                  </span>
                </div>
                
                <div className="my-auto py-4">
                  <h2 className="text-lg font-bold text-zinc-200 tracking-tight leading-tight uppercase">
                    {screening.match_name.split(' - ')[0]}
                  </h2>
                  {screening.match_name.split(' - ')[1] && (
                    <p className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase mt-1">
                      {screening.match_name.split(' - ')[1]}
                    </p>
                  )}
                </div>
                
                <div className="w-full border-t border-zinc-900 pt-3">
                  <p className="text-[9px] text-zinc-650 font-bold uppercase tracking-wider">Venue</p>
                  <p className="text-xs font-bold text-zinc-400 mt-0.5 truncate">
                    {screening.venue_name}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Details Info */}
        <div className="md:col-span-7 flex flex-col gap-5 w-full">
          
          <div>
            <div className="flex flex-wrap gap-2 items-center mb-2">
              <span className="inline-flex items-center rounded bg-zinc-900 px-2.5 py-0.5 text-[9px] font-bold text-zinc-400 border border-zinc-900">
                {screening.city}
              </span>
              {screening.sport && (
                <span className="inline-flex items-center rounded bg-emerald-950/20 border border-emerald-900/15 px-2.5 py-0.5 text-[9px] font-bold text-emerald-400">
                  {screening.sport}
                </span>
              )}
              {screening.competition && (
                <span className="inline-flex items-center rounded bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 text-[9px] font-bold text-zinc-400">
                  {screening.competition}
                </span>
              )}
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">
                Public WATCH PARTY
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
              {screening.match_name}
            </h1>
          </div>

          {/* Info Alert Banner */}
          <div className="rounded-lg bg-zinc-950 border border-zinc-900 p-4 flex gap-3 text-[11px] text-zinc-500">
            <Info className="h-4.5 w-4.5 text-zinc-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-zinc-300">Public Screening Venue</p>
              <p className="text-[11px] text-zinc-550 mt-1 leading-relaxed">
                This screening is hosted live at the venue location below. Booking is not required unless specified by the venue administrator.
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Date Details */}
            <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-lg flex items-start gap-3">
              <div className="p-2 bg-zinc-950 border border-zinc-900 text-zinc-500 rounded-md shrink-0">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-550 uppercase tracking-wider font-bold">Date</p>
                <p className="text-xs font-semibold text-zinc-305 mt-0.5">{dateStr}</p>
              </div>
            </div>

            {/* Time Details */}
            <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-lg flex items-start gap-3">
              <div className="p-2 bg-zinc-950 border border-zinc-900 text-zinc-500 rounded-md shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-550 uppercase tracking-wider font-bold">Time</p>
                <p className="text-xs font-semibold text-zinc-305 mt-0.5">{timeStr}</p>
              </div>
            </div>

            {/* Venue Details */}
            <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-lg flex items-start gap-3 sm:col-span-2">
              <div className="p-2 bg-zinc-950 border border-zinc-900 text-zinc-500 rounded-md shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-zinc-550 uppercase tracking-wider font-bold">Venue & Address</p>
                <Link href={`/venues/${venueSlug}`} className="text-xs font-semibold text-zinc-305 hover:text-white transition-colors mt-0.5 hover:underline block">
                  {screening.venue_name}
                </Link>
                <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{screening.address}</p>
              </div>
            </div>

          </div>

          {/* Description */}
          <div className="border-t border-zinc-900 pt-4">
            <h3 className="text-[10px] font-bold uppercase text-zinc-650 tracking-wider mb-2">
              Watch Party details
            </h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre-line">
              {screening.description || "No specific details have been added for this watch party."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-900 items-center">
            {screening.google_maps_link ? (
              <a
                href={screening.google_maps_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial"
              >
                <Button
                  variant="default"
                  className="w-full flex items-center justify-center gap-1.5 h-9 text-xs font-semibold px-4"
                >
                  <MapIcon className="h-4 w-4 text-zinc-950" /> Open in Google Maps <ExternalLink className="h-3 w-3 text-zinc-950" />
                </Button>
              </a>
            ) : (
              <Button
                disabled
                variant="outline"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 h-9 border-zinc-900 text-zinc-700 cursor-not-allowed text-xs font-semibold px-4"
              >
                <MapIcon className="h-4 w-4" /> Maps Link Unavailable
              </Button>
            )}
            
            <ShareButton
              screeningId={screening.id}
              matchName={screening.match_name}
              venueName={screening.venue_name}
              city={screening.city}
              datetime={screening.screening_datetime}
            />
            <ReportButton screeningId={screening.id} />
          </div>

        </div>

      </div>
    </div>
  );
}
