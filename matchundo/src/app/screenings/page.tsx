import Link from "next/link";
import { db } from "@/lib/db";
import { MapPin, Calendar, Clock, Search } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sports Match Screenings & Watch Parties | MatchUndo",
  description: "Browse upcoming live match screenings, sports watch parties, and community screenings near you.",
  alternates: {
    canonical: "/screenings",
  },
};
import { getVenueSlugMap, getVenueSlugKey, slugify } from "@/lib/venue";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PageProps {
  searchParams: Promise<{
    city?: string;
    search?: string;
    sort?: string;
    sport?: string;
    competition?: string;
  }>;
}

import { formatShortDate, formatShortTime } from "@/lib/date";

function formatScreeningDate(isoString: string) {
  try {
    const dateStr = formatShortDate(isoString);
    const timeStr = formatShortTime(isoString);
    return { dateStr, timeStr };
  } catch {
    return { dateStr: "TBD", timeStr: "TBD" };
  }
}

import { trackPageView, trackEvent } from "@/lib/analytics";

export default async function ScreeningsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentCity = params.city || "All";
  const currentSearch = params.search || "";
  const currentSort = params.sort || "asc";
  const currentSport = params.sport || "All";
  const currentCompetition = params.competition || "All";

  // Track analytics
  trackPageView("/screenings");
  if (currentSearch) {
    trackEvent("search", { query: currentSearch });
  }
  if (currentCity !== "All") {
    trackEvent("filter_city", { city: currentCity });
  }
  if (currentSport !== "All") {
    trackEvent("filter_sport", { sport: currentSport });
  }
  if (currentCompetition !== "All") {
    trackEvent("filter_competition", { competition: currentCompetition });
  }

  let screenings = await db.getApprovedScreenings();
  const slugMap = getVenueSlugMap(screenings);

  // 1. Filter by City
  if (currentCity !== "All") {
    screenings = screenings.filter(
      s => s.city.toLowerCase() === currentCity.toLowerCase()
    );
  }

  // 2. Filter by Sport
  if (currentSport !== "All") {
    screenings = screenings.filter(
      s => s.sport && s.sport.toLowerCase() === currentSport.toLowerCase()
    );
  }

  // 3. Filter by Competition
  if (currentCompetition !== "All") {
    screenings = screenings.filter(
      s => s.competition && s.competition.toLowerCase() === currentCompetition.toLowerCase()
    );
  }

  // 2. Filter by Search Query
  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    screenings = screenings.filter(
      s =>
        s.match_name.toLowerCase().includes(q) ||
        s.venue_name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }

  // 3. Sort by Date
  screenings.sort((a, b) => {
    const dateA = new Date(a.screening_datetime).getTime();
    const dateB = new Date(b.screening_datetime).getTime();
    return currentSort === "desc" ? dateB - dateA : dateA - dateB;
  });

  const cities = ["All", "Kochi", "Thrissur", "Kozhikode", "Trivandrum", "Kottayam"];
  const sports = ["All", "Football", "Cricket", "Formula 1", "Kabaddi", "Esports", "Other"];
  const competitions = ["All", "FIFA World Cup", "IPL", "ISL", "Premier League", "UEFA Champions League", "Cricket World Cup"];

  const getFilterUrl = (newParams: { city?: string; search?: string; sort?: string; sport?: string; competition?: string }) => {
    const merged = {
      city: newParams.city !== undefined ? newParams.city : currentCity,
      search: newParams.search !== undefined ? newParams.search : currentSearch,
      sort: newParams.sort !== undefined ? newParams.sort : currentSort,
      sport: newParams.sport !== undefined ? newParams.sport : currentSport,
      competition: newParams.competition !== undefined ? newParams.competition : currentCompetition,
    };
    
    const queryParts = [];
    if (merged.city && merged.city !== "All") queryParts.push(`city=${encodeURIComponent(merged.city)}`);
    if (merged.search) queryParts.push(`search=${encodeURIComponent(merged.search)}`);
    if (merged.sort && merged.sort !== "asc") queryParts.push(`sort=${encodeURIComponent(merged.sort)}`);
    if (merged.sport && merged.sport !== "All") queryParts.push(`sport=${encodeURIComponent(merged.sport)}`);
    if (merged.competition && merged.competition !== "All") queryParts.push(`competition=${encodeURIComponent(merged.competition)}`);
    
    return queryParts.length > 0 ? `/screenings?${queryParts.join("&")}` : "/screenings";
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Match Screenings
          </h1>
          <p className="text-zinc-500 text-[11px] mt-0.5">
            Browse public watch parties and screenings in Kerala.
          </p>
        </div>
        <div className="text-[11px] text-zinc-500 font-semibold">
          {screenings.length} watches available
        </div>
      </div>

      {/* Filters and Controls Area */}
      <div className="bg-zinc-950/20 border border-zinc-900 rounded-xl p-4 sm:p-5 mb-8 flex flex-col gap-4">
        
        {/* Search & Sort Row */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <form method="GET" action="/screenings" className="w-full md:max-w-md relative flex items-center">
            {currentCity !== "All" && <input type="hidden" name="city" value={currentCity} />}
            {currentSort !== "asc" && <input type="hidden" name="sort" value={currentSort} />}
            {currentSport !== "All" && <input type="hidden" name="sport" value={currentSport} />}
            {currentCompetition !== "All" && <input type="hidden" name="competition" value={currentCompetition} />}
            
            <Search className="absolute left-3 text-zinc-650 h-3.5 w-3.5" />
            <Input
              type="text"
              name="search"
              defaultValue={currentSearch}
              placeholder="Search matches or venues..."
              className="w-full bg-zinc-950 pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-650 border-zinc-900 focus:border-zinc-800"
            />
          </form>

          {/* Sort Control */}
          <div className="flex items-center gap-2 self-end md:self-auto justify-end text-[11px]">
            <span className="text-zinc-500">Date order:</span>
            <div className="inline-flex rounded bg-zinc-950 p-0.5 border border-zinc-900">
              <Link
                href={getFilterUrl({ sort: "asc" })}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  currentSort === "asc"
                    ? "bg-zinc-100 text-zinc-950"
                    : "text-zinc-450 hover:text-zinc-200"
                }`}
              >
                Nearest
              </Link>
              <Link
                href={getFilterUrl({ sort: "desc" })}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  currentSort === "desc"
                    ? "bg-zinc-100 text-zinc-950"
                    : "text-zinc-450 hover:text-zinc-200"
                }`}
              >
                Furthest
              </Link>
            </div>
          </div>
        </div>

        {/* City Filter Tabs */}
        <div className="border-t border-zinc-900/60 pt-4 flex flex-col gap-2">
          <span className="text-zinc-550 text-[10px] font-bold uppercase tracking-wider">Select City:</span>
          <div className="flex flex-wrap gap-1.5">
            {cities.map((city) => {
              const isActive = currentCity.toLowerCase() === city.toLowerCase();
              return (
                <Link
                  key={city}
                  href={getFilterUrl({ city })}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all border ${
                    isActive
                      ? "bg-zinc-100 border-zinc-105 text-zinc-950"
                      : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  {city}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sport Filter Tabs */}
        <div className="border-t border-zinc-900/60 pt-4 flex flex-col gap-2">
          <span className="text-zinc-555 text-[10px] font-bold uppercase tracking-wider">Select Sport:</span>
          <div className="flex flex-wrap gap-1.5">
            {sports.map((sp) => {
              const isActive = currentSport.toLowerCase() === sp.toLowerCase();
              return (
                <Link
                  key={sp}
                  href={getFilterUrl({ sport: sp })}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all border ${
                    isActive
                      ? "bg-zinc-100 border-zinc-105 text-zinc-950"
                      : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  {sp}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Competition Filter Tabs */}
        <div className="border-t border-zinc-900/60 pt-4 flex flex-col gap-2">
          <span className="text-zinc-555 text-[10px] font-bold uppercase tracking-wider">Select Competition:</span>
          <div className="flex flex-wrap gap-1.5">
            {competitions.map((comp) => {
              const isActive = currentCompetition.toLowerCase() === comp.toLowerCase();
              return (
                <Link
                  key={comp}
                  href={getFilterUrl({ competition: comp })}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all border ${
                    isActive
                      ? "bg-zinc-100 border-zinc-105 text-zinc-950"
                      : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  {comp}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid List */}
      {screenings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {screenings.map((screening) => {
            const { dateStr, timeStr } = formatScreeningDate(screening.screening_datetime);
            return (
              <Card key={screening.id} className="flex flex-col h-full overflow-hidden border-zinc-900 hover:border-zinc-850">
                {/* Poster image or placeholder */}
                <div className="relative h-40 w-full bg-zinc-950 overflow-hidden flex items-center justify-center border-b border-zinc-900">
                  {screening.poster_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={screening.poster_image_url}
                      alt={screening.match_name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    /* Notion-style minimal card placeholder banner */
                    <div className="absolute inset-0 flex flex-col justify-between p-4 bg-zinc-950/40">
                      <div className="w-full flex justify-between text-[9px] text-zinc-550 font-bold uppercase tracking-wider">
                        <span>{screening.sport || "Sports"}</span>
                        <span className="text-emerald-500 font-medium">{screening.competition || "Live Match"}</span>
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
                      
                      <div className="w-full text-[9px] text-zinc-550 truncate">
                        Venue: {screening.venue_name}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Header & Content */}
                <CardHeader className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center rounded bg-zinc-900 px-2 py-0.5 text-[9px] font-bold text-zinc-350 border border-zinc-850">
                        {screening.city}
                      </span>
                      {screening.sport && (
                        <span className="inline-flex items-center rounded bg-emerald-950/20 border border-emerald-900/15 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                          {screening.sport}
                        </span>
                      )}
                      {screening.competition && (
                        <span className="inline-flex items-center rounded bg-zinc-900 border border-zinc-850 px-2 py-0.5 text-[9px] font-bold text-zinc-400">
                          {screening.competition}
                        </span>
                      )}
                    </div>

                    <CardTitle className="text-xs font-bold line-clamp-2 leading-tight">{screening.match_name}</CardTitle>
                    <p className="text-[11px] text-zinc-550 mt-1">
                      Venue: <Link href={`/venues/${slugMap.get(getVenueSlugKey(screening.venue_name, screening.city, screening.address)) || slugify(screening.venue_name)}`} className="text-zinc-355 hover:text-white transition-colors hover:underline">{screening.venue_name}</Link>
                    </p>
                    <p className="text-[11px] text-zinc-500 line-clamp-2 mt-3 leading-relaxed">
                      {screening.description || "No description provided."}
                    </p>
                  </div>

                  <ContentWrapper dateStr={dateStr} timeStr={timeStr} address={screening.address} screeningId={screening.id} />
                </CardHeader>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <Card className="p-16 text-center max-w-sm mx-auto mt-10 border-zinc-900">
          <h3 className="text-xs font-bold text-white mb-1">No screenings found</h3>
          <p className="text-zinc-500 text-[11px] mb-5 leading-relaxed">
            There are no match watch parties listed matching your city filters or search keyword.
          </p>
          <Link href="/screenings">
            <Button size="sm" variant="outline" className="text-xs font-semibold border-zinc-900">
              Clear filters
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}

// Internal wrapper to simplify JSX and make it neat
function ContentWrapper({ dateStr, timeStr, address, screeningId }: { dateStr: string; timeStr: string; address: string; screeningId: string }) {
  return (
    <CardContent className="p-0 mt-4">
      {/* Date details wrapper */}
      <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-900 text-[11px] text-zinc-450 flex flex-col gap-1.5 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-zinc-650" />
          <span>{dateStr}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-zinc-650" />
          <span>{timeStr}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-zinc-650" />
          <span className="truncate">{address}</span>
        </div>
      </div>

      <Link href={`/screenings/${screeningId}`}>
        <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
          View Details
        </Button>
      </Link>
    </CardContent>
  );
}
