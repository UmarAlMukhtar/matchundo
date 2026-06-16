import Link from "next/link";
import { db } from "@/lib/db";
import { MapPin, Calendar, Clock, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PageProps {
  searchParams: Promise<{
    city?: string;
    search?: string;
    sort?: string;
  }>;
}

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

export default async function ScreeningsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentCity = params.city || "All";
  const currentSearch = params.search || "";
  const currentSort = params.sort || "asc";

  let screenings = await db.getScreenings();

  // 1. Filter by City
  if (currentCity !== "All") {
    screenings = screenings.filter(
      s => s.city.toLowerCase() === currentCity.toLowerCase()
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

  const getFilterUrl = (newParams: { city?: string; search?: string; sort?: string }) => {
    const merged = {
      city: newParams.city !== undefined ? newParams.city : currentCity,
      search: newParams.search !== undefined ? newParams.search : currentSearch,
      sort: newParams.sort !== undefined ? newParams.sort : currentSort,
    };
    
    const queryParts = [];
    if (merged.city && merged.city !== "All") queryParts.push(`city=${encodeURIComponent(merged.city)}`);
    if (merged.search) queryParts.push(`search=${encodeURIComponent(merged.search)}`);
    if (merged.sort && merged.sort !== "asc") queryParts.push(`sort=${encodeURIComponent(merged.sort)}`);
    
    return queryParts.length > 0 ? `/screenings?${queryParts.join("&")}` : "/screenings";
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col">
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            FIFA Screenings
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            Browse public watch parties and matches broadcasting in Kerala.
          </p>
        </div>
        <div className="text-xs text-zinc-500 font-medium">
          {screenings.length} watch parties found
        </div>
      </div>

      {/* Filters and Controls Area */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-4 sm:p-5 mb-8 flex flex-col gap-5">
        
        {/* Search & Sort Row */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <form method="GET" action="/screenings" className="w-full md:max-w-md relative flex items-center">
            {currentCity !== "All" && <input type="hidden" name="city" value={currentCity} />}
            {currentSort !== "asc" && <input type="hidden" name="sort" value={currentSort} />}
            
            <Search className="absolute left-3.5 text-zinc-650 h-4 w-4" />
            <Input
              type="text"
              name="search"
              defaultValue={currentSearch}
              placeholder="Search matches or venues..."
              className="w-full bg-zinc-950 pl-10 pr-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-zinc-700"
            />
          </form>

          {/* Sort Control */}
          <div className="flex items-center gap-2 self-end md:self-auto justify-end text-xs">
            <span className="text-zinc-500">Sort by date:</span>
            <div className="inline-flex rounded-md bg-zinc-950 p-0.5 border border-zinc-900">
              <Link
                href={getFilterUrl({ sort: "asc" })}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  currentSort === "asc"
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Nearest
              </Link>
              <Link
                href={getFilterUrl({ sort: "desc" })}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  currentSort === "desc"
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Furthest
              </Link>
            </div>
          </div>
        </div>

        {/* City Filter Tabs */}
        <div className="border-t border-zinc-900 pt-4 flex flex-col gap-2">
          <span className="text-zinc-500 text-xs font-medium">Filter by city:</span>
          <div className="flex flex-wrap gap-1.5">
            {cities.map((city) => {
              const isActive = currentCity.toLowerCase() === city.toLowerCase();
              return (
                <Link
                  key={city}
                  href={getFilterUrl({ city })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                    isActive
                      ? "bg-zinc-100 border-zinc-100 text-zinc-900 font-bold"
                      : "bg-zinc-950 border-zinc-900 text-zinc-350 hover:border-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  {city}
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
              <Card key={screening.id} className="flex flex-col h-full overflow-hidden hover:border-zinc-700 border-zinc-850">
                {/* Poster Image or Placeholder */}
                <div className="relative h-44 w-full bg-zinc-900 overflow-hidden flex items-center justify-center border-b border-zinc-900">
                  {screening.poster_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={screening.poster_image_url}
                      alt={screening.match_name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    /* Notion-style minimal banner */
                    <div className="absolute inset-0 flex flex-col justify-between p-5 bg-zinc-950">
                      <div className="w-full flex justify-between text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                        <span>Kerala watch</span>
                        <span className="text-emerald-500">World Cup</span>
                      </div>
                      
                      <div className="text-left py-1">
                        <p className="text-sm font-bold text-white leading-tight uppercase line-clamp-2">
                          {screening.match_name.split(' - ')[0]}
                        </p>
                        {screening.match_name.split(' - ')[1] && (
                          <p className="text-[10px] text-zinc-450 mt-0.5 font-medium">
                            {screening.match_name.split(' - ')[1]}
                          </p>
                        )}
                      </div>
                      
                      <div className="w-full text-[9px] text-zinc-500 truncate">
                        🏟️ {screening.venue_name}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <CardHeader className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="mb-2">
                      <span className="inline-flex items-center rounded bg-zinc-900 px-2 py-0.5 text-[10px] font-bold text-zinc-300 border border-zinc-850">
                        {screening.city}
                      </span>
                    </div>

                    <CardTitle className="text-base line-clamp-2">{screening.match_name}</CardTitle>
                    <p className="text-xs text-zinc-400 mt-1.5 flex items-center gap-1">
                      <span className="text-zinc-500">Venue:</span> <span className="text-zinc-200">{screening.venue_name}</span>
                    </p>
                    <p className="text-xs text-zinc-500 line-clamp-2 mt-3 leading-relaxed">
                      {screening.description || "No description provided."}
                    </p>
                  </div>

                  <CardContent className="p-0 mt-5">
                    {/* Date details wrapper */}
                    <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-900 text-xs text-zinc-400 flex flex-col gap-1.5 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                        <span>{dateStr}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-zinc-500" />
                        <span>{timeStr}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                        <span className="truncate">{screening.address}</span>
                      </div>
                    </div>

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
        /* Empty State */
        <Card className="p-16 text-center max-w-md mx-auto mt-10 border-zinc-850">
          <h3 className="text-sm font-bold text-white mb-1">No screenings found</h3>
          <p className="text-zinc-500 text-xs mb-6">
            We couldn&apos;t find any match screenings matching your criteria. Try adjusting your filters.
          </p>
          <Link href="/screenings">
            <Button size="sm" variant="outline" className="text-xs">
              Reset filters
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
