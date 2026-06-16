import Link from "next/link";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { MapPin, Calendar, Clock, ArrowLeft, ExternalLink, Map, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatScreeningDateTime(isoString: string) {
  try {
    const d = new Date(isoString);
    const dateStr = d.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
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

export default async function ScreeningDetailPage({ params }: PageProps) {
  const { id } = await params;
  const screening = await db.getScreeningById(id);

  if (!screening) {
    notFound();
  }

  const { dateStr, timeStr } = formatScreeningDateTime(screening.screening_datetime);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          href="/screenings"
          className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to screenings
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full items-start">
        
        {/* Left Column: Poster Image / Graphics */}
        <div className="md:col-span-5 w-full">
          <Card className="overflow-hidden border-zinc-850 shadow-md">
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
                  <span className="inline-flex items-center rounded-md bg-zinc-900 px-2 py-0.5 text-[10px] font-bold text-zinc-455 border border-zinc-850 uppercase tracking-widest">
                    World Cup
                  </span>
                </div>
                
                <div className="my-auto py-4">
                  <h2 className="text-xl font-bold text-white tracking-tight leading-tight uppercase">
                    {screening.match_name.split(' - ')[0]}
                  </h2>
                  {screening.match_name.split(' - ')[1] && (
                    <p className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase mt-1">
                      {screening.match_name.split(' - ')[1]}
                    </p>
                  )}
                </div>
                
                <div className="w-full border-t border-zinc-900 pt-3">
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Venue</p>
                  <p className="text-xs font-bold text-zinc-300 mt-0.5 truncate">
                    {screening.venue_name}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Details Info */}
        <div className="md:col-span-7 flex flex-col gap-5 w-full">
          {/* Match & Location Title */}
          <div>
            <div className="flex flex-wrap gap-2 items-center mb-2">
              <span className="inline-flex items-center rounded bg-zinc-900 px-2 py-0.5 text-[10px] font-bold text-zinc-350 border border-zinc-850">
                {screening.city}
              </span>
              <span className="text-[10px] text-zinc-550 uppercase tracking-wider font-semibold">
                Public Watch Party
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              {screening.match_name}
            </h1>
          </div>

          {/* Info Alert Banner */}
          <div className="rounded-xl bg-zinc-950 border border-zinc-900 p-4 flex gap-3 text-xs text-zinc-400">
            <Info className="h-4.5 w-4.5 text-zinc-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-zinc-300">Public Screening Information</p>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                This is a public watcher gathering. Advance booking is not required unless specified by the venue host. We recommend arriving early.
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Date Details */}
            <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl flex items-start gap-3">
              <div className="p-2 bg-zinc-900 border border-zinc-850 text-zinc-400 rounded-lg shrink-0">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Date</p>
                <p className="text-xs font-bold text-zinc-200 mt-1">{dateStr}</p>
              </div>
            </div>

            {/* Time Details */}
            <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl flex items-start gap-3">
              <div className="p-2 bg-zinc-900 border border-zinc-850 text-zinc-400 rounded-lg shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Time</p>
                <p className="text-xs font-bold text-zinc-200 mt-1">{timeStr}</p>
              </div>
            </div>

            {/* Venue Details */}
            <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl flex items-start gap-3 sm:col-span-2">
              <div className="p-2 bg-zinc-900 border border-zinc-850 text-zinc-400 rounded-lg shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Venue & Address</p>
                <p className="text-xs font-bold text-zinc-200 mt-1">{screening.venue_name}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{screening.address}</p>
              </div>
            </div>

          </div>

          {/* Description */}
          <div className="border-t border-zinc-900 pt-5">
            <h3 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-2">
              About this screening
            </h3>
            <p className="text-xs text-zinc-350 leading-relaxed whitespace-pre-line">
              {screening.description || "No description provided for this watch party."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-zinc-900">
            {screening.google_maps_link ? (
              <a
                href={screening.google_maps_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  variant="default"
                  className="w-full flex items-center justify-center gap-1.5 h-11 text-zinc-900 bg-zinc-100 hover:bg-zinc-200"
                >
                  <Map className="h-4 w-4" /> Open in Google Maps <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            ) : (
              <Button
                disabled
                variant="outline"
                className="flex-1 flex items-center justify-center gap-1.5 h-11 border-zinc-850 text-zinc-650 cursor-not-allowed"
              >
                <Map className="h-4 w-4" /> Maps link unavailable
              </Button>
            )}
            
            {/* Safe Copy URL Share button client component */}
            <ShareButton />
          </div>

        </div>

      </div>
    </div>
  );
}
