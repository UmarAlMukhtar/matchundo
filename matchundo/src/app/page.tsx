import Link from "next/link";
import { db } from "@/lib/db";
import { MapPin, Calendar, Clock, ArrowRight, Search, Play } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

function formatScreeningDate(isoString: string) {
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

export default async function HomePage() {
  const allScreenings = await db.getScreenings();
  
  // Filter for future/upcoming screenings
  const now = new Date();
  const upcomingScreenings = allScreenings
    .filter(s => new Date(s.screening_datetime) >= now)
    .slice(0, 3);

  const featuredCities = ["Kochi", "Thrissur", "Kozhikode", "Trivandrum", "Kottayam"];

  return (
    <div className="flex flex-col items-center justify-start flex-1 w-full pb-20">
      
      {/* Hero Section */}
      <section className="relative w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center flex flex-col items-center">
        
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-900 text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-6">
          <Play className="h-2.5 w-2.5 text-emerald-500 fill-emerald-500" /> Watch Screenings Kerala
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl max-w-xl mx-auto leading-tight mb-3">
          Find World Cup Screenings Near You
        </h1>
        
        <p className="text-xs sm:text-sm text-zinc-450 max-w-md mx-auto mb-8 leading-relaxed">
          Discover public watch parties, outdoor screenings, and local venues broadcasting matches live across Kerala.
        </p>

        {/* Search Input Bar */}
        <div className="w-full max-w-md mx-auto bg-zinc-950 p-1 rounded-xl border border-zinc-900 mb-6">
          <form action="/screenings" method="GET" className="flex gap-2">
            <div className="flex-1 relative flex items-center">
              <Search className="absolute left-3 text-zinc-650 h-3.5 w-3.5" />
              <Input
                type="text"
                name="search"
                placeholder="Search by city or match name..."
                className="w-full bg-transparent pl-9 pr-3 py-1.5 border-none focus-visible:ring-0 text-xs shadow-none"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="bg-zinc-100 text-zinc-950 font-semibold h-8 text-[11px]"
            >
              Search
            </Button>
          </form>
        </div>

        {/* City Filter Links */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-zinc-500">
          <span>Featured:</span>
          {featuredCities.map((city) => (
            <Link
              key={city}
              href={`/screenings?city=${city}`}
              className="px-2 py-0.5 rounded border border-zinc-900 bg-zinc-950 text-zinc-450 hover:text-white hover:border-zinc-800 transition-colors"
            >
              {city}
            </Link>
          ))}
        </div>
      </section>

      {/* Upcoming Screenings Grid */}
      <section className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 mt-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-6">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Upcoming Match Watch Parties
            </h2>
            <p className="text-zinc-500 text-[10px] mt-0.5">
              Live screenings scheduled across football hotspots.
            </p>
          </div>
          <Link
            href="/screenings"
            className="group flex items-center gap-0.5 text-[11px] font-semibold text-zinc-455 hover:text-zinc-200 transition-colors"
          >
            View all ({allScreenings.length})
            <ArrowRight className="h-3 w-3 transform transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {upcomingScreenings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingScreenings.map((screening) => {
              const { dateStr, timeStr } = formatScreeningDate(screening.screening_datetime);
              return (
                <Card key={screening.id} className="flex flex-col h-full overflow-hidden border-zinc-900 hover:border-zinc-850">
                  {/* Poster Image Area */}
                  <div className="relative h-40 w-full bg-zinc-950 border-b border-zinc-900 overflow-hidden flex items-center justify-center">
                    {screening.poster_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={screening.poster_image_url}
                        alt={screening.match_name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      /* Minimal text-based banner */
                      <div className="absolute inset-0 flex flex-col justify-between p-4 bg-zinc-950/40">
                        <div className="flex justify-between items-center text-[9px] text-zinc-550 font-bold uppercase tracking-wider">
                          <span>Live Broadcast</span>
                          <span className="text-emerald-500 font-medium lowercase tracking-normal">scheduled</span>
                        </div>
                        
                        <div className="text-left py-1">
                          <p className="text-xs font-bold text-zinc-100 leading-snug uppercase line-clamp-2">
                            {screening.match_name.split(' - ')[0]}
                          </p>
                          {screening.match_name.split(' - ')[1] && (
                            <p className="text-[9px] text-zinc-500 mt-0.5">
                              {screening.match_name.split(' - ')[1]}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-[9px] text-zinc-550 truncate">
                          Venue: {screening.venue_name}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <CardHeader className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <CardTitle className="text-xs font-bold leading-tight line-clamp-1">{screening.match_name}</CardTitle>
                      <CardDescription className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
                        <span>Venue:</span> <span className="text-zinc-350">{screening.venue_name}</span>
                      </CardDescription>

                      <div className="mt-4 pt-3.5 border-t border-zinc-900/60 flex flex-col gap-2 text-[11px] text-zinc-450">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-zinc-650" />
                          <span>{screening.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-zinc-650" />
                          <span>{dateStr}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-zinc-650" />
                          <span>{timeStr}</span>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-0 mt-5">
                      <Link href={`/screenings/${screening.id}`}>
                        <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                          View Details
                        </Button>
                      </Link>
                    </CardContent>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-10 text-center max-w-sm mx-auto flex flex-col items-center border-zinc-900">
            <h3 className="text-xs font-bold text-white mb-1">No screenings available</h3>
            <p className="text-zinc-500 text-[11px] mb-4">
              There are no live screenings scheduled at this time.
            </p>
            <Link href="/admin">
              <Button size="sm" variant="outline" className="text-xs font-semibold">
                Go to Dashboard
              </Button>
            </Link>
          </Card>
        )}
      </section>

      {/* Info Promo Section */}
      <section className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 mt-12">
        <div className="rounded-lg border border-zinc-900 p-5 bg-zinc-950/40">
          <div className="max-w-lg">
            <h2 className="text-xs font-bold text-white mb-1.5 uppercase tracking-wide">
              Kerala Football Watch Parties
            </h2>
            <p className="text-[11px] text-zinc-500 leading-relaxed mb-4">
              MatchUndo index watch parties, public screenings, beach screens, and local stadium venues broadcasting matches in Kerala. Discover screenings in your local neighborhood and join the community.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Link href="/screenings">
                <Button size="sm" variant="default" className="text-xs font-semibold">
                  Browse Watch Listings
                </Button>
              </Link>
              <Link href="/admin">
                <Button size="sm" variant="outline" className="text-xs font-semibold border-zinc-900">
                  Manage Panel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
