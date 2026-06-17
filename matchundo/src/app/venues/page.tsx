import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sports Screening Venues | MatchUndo",
  description: "Explore venues, cafes, pubs, and turf grounds hosting live match screenings and sports watch parties.",
  alternates: {
    canonical: "/venues",
  },
};
import { getVenuesFromScreenings } from "@/lib/venue";
import { trackPageView } from "@/lib/analytics";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, Play } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VenuesPage() {
  // Track page view
  trackPageView("/venues");

  const screenings = await db.getApprovedScreenings();
  const venues = getVenuesFromScreenings(screenings);

  // Map venues to include their screening counts
  const venuesWithCounts = venues.map((venue) => {
    const count = screenings.filter(
      (s) => s.venue_name.trim().toLowerCase() === venue.venueName.toLowerCase() &&
             s.city.trim().toLowerCase() === venue.city.toLowerCase() &&
             s.address.trim().toLowerCase() === venue.address.toLowerCase()
    ).length;

    return {
      ...venue,
      count
    };
  }).sort((a, b) => b.count - a.count); // Sort by most screenings first

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Screening Venues
          </h1>
          <p className="text-zinc-550 text-[11px] mt-0.5">
            Explore sports hubs, cafes, and open grounds hosting public match screenings in Kerala.
          </p>
        </div>
        <div className="text-[11px] text-zinc-500 font-semibold">
          {venuesWithCounts.length} active venues
        </div>
      </div>

      {venuesWithCounts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {venuesWithCounts.map((venue) => (
            <Card key={venue.slug} className="flex flex-col h-full border-zinc-900 hover:border-zinc-850 transition-colors">
              <CardHeader className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="inline-flex items-center rounded bg-zinc-900 border border-zinc-850 px-2.5 py-0.5 text-[9px] font-bold text-zinc-400">
                      {venue.city}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-semibold flex items-center gap-1">
                      <Play className="h-3 w-3 text-emerald-500 fill-emerald-500" />
                      {venue.count} {venue.count === 1 ? "screening" : "screenings"}
                    </span>
                  </div>

                  <CardTitle className="text-xs font-bold leading-tight mb-2">
                    {venue.venueName}
                  </CardTitle>
                  
                  <p className="text-[11px] text-zinc-500 leading-relaxed mb-4">
                    Hosting live football match screenings. Location: <span className="text-zinc-350">{venue.address}</span>.
                  </p>
                </div>

                <CardContent className="p-0 mt-2">
                  <Link href={`/venues/${venue.slug}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs font-semibold h-8 border-zinc-900 hover:border-zinc-850 flex items-center justify-center gap-1">
                      View Venue Schedule <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </CardContent>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-16 text-center max-w-sm mx-auto border-zinc-900 bg-zinc-950/20 mt-10">
          <MapPin className="h-6 w-6 text-zinc-650 mx-auto mb-3" />
          <h3 className="text-xs font-bold text-white mb-1">No venues found</h3>
          <p className="text-zinc-500 text-[11px] leading-relaxed">
            There are no screening venues indexed in the directory at the moment.
          </p>
        </Card>
      )}
    </div>
  );
}
