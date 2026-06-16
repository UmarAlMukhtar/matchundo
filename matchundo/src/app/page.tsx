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
      <section className="relative w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center flex flex-col items-center">
        
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium mb-6">
          <Play className="h-3 w-3 text-emerald-500 fill-emerald-500" /> FIFA World Cup Screenings
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl max-w-2xl mx-auto leading-tight mb-4">
          Find World Cup Screenings Near You
        </h1>
        
        <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto mb-8 leading-relaxed">
          Discover public watch parties, outdoor screenings, and venues broadcasting matches live across Kerala.
        </p>

        {/* Search Input Bar */}
        <div className="w-full max-w-lg mx-auto bg-zinc-950 p-1.5 rounded-xl border border-zinc-850 shadow-md mb-6">
          <form action="/screenings" method="GET" className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative flex items-center">
              <Search className="absolute left-3.5 text-zinc-550 h-4 w-4" />
              <Input
                type="text"
                name="search"
                placeholder="Search by city or match name..."
                className="w-full bg-transparent pl-10 pr-3 py-2 border-none focus-visible:ring-0 text-sm shadow-none"
              />
            </div>
            <Button
              type="submit"
              className="bg-zinc-100 text-zinc-900 font-semibold text-xs h-9 px-4 active:scale-95 transition-all shrink-0"
            >
              Search
            </Button>
          </form>
        </div>

        {/* City Filter Links */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-zinc-500">
          <span>Browse cities:</span>
          {featuredCities.map((city) => (
            <Link
              key={city}
              href={`/screenings?city=${city}`}
              className="px-2.5 py-1 rounded-md bg-zinc-900/60 border border-zinc-850 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
            >
              {city}
            </Link>
          ))}
        </div>
      </section>

      {/* Upcoming Screenings Grid */}
      <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Upcoming Screenings
            </h2>
            <p className="text-zinc-500 text-xs mt-0.5">
              Watch parties scheduled across football hotspots.
            </p>
          </div>
          <Link
            href="/screenings"
            className="group flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            View all screenings ({allScreenings.length})
            <ArrowRight className="h-3 w-3 transform transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {upcomingScreenings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingScreenings.map((screening) => {
              const { dateStr, timeStr } = formatScreeningDate(screening.screening_datetime);
              return (
                <Card key={screening.id} className="flex flex-col h-full overflow-hidden hover:border-zinc-700 border-zinc-850">
                  {/* Poster Image Area */}
                  <div className="relative h-44 w-full bg-zinc-900 border-b border-zinc-900 overflow-hidden flex items-center justify-center">
                    {screening.poster_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={screening.poster_image_url}
                        alt={screening.match_name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      /* Minimal text-based banner matching Notion style */
                      <div className="absolute inset-0 flex flex-col justify-between p-5 bg-zinc-950">
                        <div className="flex justify-between items-center text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                          <span>Screening</span>
                          <span className="text-emerald-500 font-semibold">Live</span>
                        </div>
                        
                        <div className="text-left py-2">
                          <p className="text-sm font-bold text-white tracking-tight uppercase line-clamp-2">
                            {screening.match_name.split(' - ')[0]}
                          </p>
                          {screening.match_name.split(' - ')[1] && (
                            <p className="text-[10px] text-zinc-400 mt-0.5">
                              {screening.match_name.split(' - ')[1]}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-[10px] text-zinc-500 truncate">
                          At {screening.venue_name}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <CardHeader className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <CardTitle className="text-base line-clamp-1">{screening.match_name}</CardTitle>
                      <CardDescription className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                        <span>Venue:</span> <span className="text-zinc-200">{screening.venue_name}</span>
                      </CardDescription>

                      <div className="mt-4 pt-4 border-t border-zinc-900 flex flex-col gap-2 text-xs text-zinc-400">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                          <span>{screening.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                          <span>{dateStr}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-zinc-500" />
                          <span>{timeStr}</span>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-0 mt-5">
                      <Link href={`/screenings/${screening.id}`}>
                        <Button variant="outline" className="w-full text-xs font-semibold py-2">
                          View details
                        </Button>
                      </Link>
                    </CardContent>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-10 text-center max-w-md mx-auto flex flex-col items-center border-zinc-850">
            <h3 className="text-sm font-bold text-white mb-1">No upcoming screenings</h3>
            <p className="text-zinc-500 text-xs mb-4">
              There are no screenings scheduled at this moment.
            </p>
            <Link href="/admin">
              <Button size="sm" variant="outline" className="text-xs">
                Manage screenings
              </Button>
            </Link>
          </Card>
        )}
      </section>

      {/* Info Promo Section */}
      <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
        <div className="rounded-xl border border-zinc-850 p-6 sm:p-8 bg-zinc-950/40">
          <div className="max-w-xl">
            <h2 className="text-base font-bold text-white mb-2">
              Community Watch Parties
            </h2>
            <p className="text-xs sm:text-sm text-zinc-450 leading-relaxed mb-4">
              MatchUndo coordinates public venues, sports clubs, and neighborhood beach screenings displaying matches live in Kerala. Gather with local supporters to experience the game together.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/screenings">
                <Button size="sm" variant="default" className="text-xs font-semibold">
                  Browse matches
                </Button>
              </Link>
              <Link href="/admin">
                <Button size="sm" variant="outline" className="text-xs font-semibold">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
