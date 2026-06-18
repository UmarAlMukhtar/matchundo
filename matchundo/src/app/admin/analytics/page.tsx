import React from "react";
import { redirect } from "next/navigation";
import { checkAdminAuth } from "@/app/actions";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  MapPin, 
  FileText, 
  Globe, 
  Share2, 
  ExternalLink,
  MessageSquare,
  Link as LinkIcon,
  Smartphone
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const isAuthenticated = await checkAdminAuth();
  
  if (!isAuthenticated) {
    redirect("/admin");
  }

  // Fetch data directly from the database
  const screenings = await db.getScreenings();
  const reports = await db.getReports();
  const shareEvents = await db.getShareEvents();

  // --- SECTION 1: Platform Overview ---
  const totalScreenings = screenings.length;
  const approvedScreenings = screenings.filter(s => s.status === "approved").length;
  const pendingSubmissions = screenings.filter(s => s.status === "pending").length;
  const rejectedSubmissions = screenings.filter(s => s.status === "rejected").length;
  
  const approvedScreeningsList = screenings.filter(s => s.status === "approved");
  const venueSet = new Set(approvedScreeningsList.map(s => s.venue_name.trim().toLowerCase()));
  const totalVenues = venueSet.size;
  
  const totalReports = reports.length;

  // --- SECTION 2: Community Activity ---
  
  // 1. Top Cities
  const cityStatsMap = new Map<string, { approved: number; total: number }>();
  screenings.forEach(s => {
    const city = s.city.trim();
    if (!city) return;
    const stats = cityStatsMap.get(city) || { approved: 0, total: 0 };
    stats.total += 1;
    if (s.status === "approved") {
      stats.approved += 1;
    }
    cityStatsMap.set(city, stats);
  });

  const topCities = Array.from(cityStatsMap.entries())
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.approved - a.approved || b.total - a.total);

  // 2. Top Venues
  const venueStatsMap = new Map<string, { name: string; city: string; count: number }>();
  approvedScreeningsList.forEach(s => {
    const key = `${s.venue_name.trim().toLowerCase()}||${s.city.trim().toLowerCase()}`;
    const stats = venueStatsMap.get(key) || { name: s.venue_name, city: s.city, count: 0 };
    stats.count += 1;
    venueStatsMap.set(key, stats);
  });

  const topVenues = Array.from(venueStatsMap.values())
    .sort((a, b) => b.count - a.count);

  // 3. Most Shared Screenings
  const shareStatsMap = new Map<string, { whatsapp: number; copyLink: number; native: number; total: number }>();
  shareEvents.forEach(e => {
    const stats = shareStatsMap.get(e.screening_id) || { whatsapp: 0, copyLink: 0, native: 0, total: 0 };
    stats.total += 1;
    if (e.share_type === 'whatsapp_share') {
      stats.whatsapp += 1;
    } else if (e.share_type === 'copy_link') {
      stats.copyLink += 1;
    } else if (e.share_type === 'native_share') {
      stats.native += 1;
    }
    shareStatsMap.set(e.screening_id, stats);
  });

  const mostShared = Array.from(shareStatsMap.entries())
    .map(([screeningId, stats]) => {
      const screening = screenings.find(s => s.id === screeningId);
      return {
        id: screeningId,
        matchName: screening?.match_name || "Deleted Screening",
        venueName: screening?.venue_name || "Unknown Venue",
        ...stats
      };
    })
    .sort((a, b) => b.total - a.total);

  // --- SECTION 3: Growth Metrics ---
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const getGrowthMetrics = (startDate: Date) => {
    const newSubmissions = screenings.filter(s => {
      const created = s.created_at ? new Date(s.created_at) : new Date();
      return created >= startDate;
    }).length;

    const approved = screenings.filter(s => {
      if (s.status !== "approved" || !s.reviewed_at) return false;
      const reviewed = new Date(s.reviewed_at);
      return reviewed >= startDate;
    }).length;

    const rejected = screenings.filter(s => {
      if (s.status !== "rejected" || !s.reviewed_at) return false;
      const reviewed = new Date(s.reviewed_at);
      return reviewed >= startDate;
    }).length;

    const userReports = reports.filter(r => {
      const created = r.created_at ? new Date(r.created_at) : new Date();
      return created >= startDate;
    }).length;

    return { newSubmissions, approved, rejected, userReports };
  };

  const last7Days = getGrowthMetrics(sevenDaysAgo);
  const last30Days = getGrowthMetrics(thirtyDaysAgo);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col space-y-10">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Analytics Dashboard
        </h1>
        <p className="text-zinc-550 text-[11px] mt-0.5 font-semibold">
          Actionable business KPIs, community activity, and content sharing patterns.
        </p>
      </div>

      {/* SECTION 1: Platform Overview */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Platform Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          
          {/* Total Screenings */}
          <Card className="border-zinc-900 bg-zinc-950/40 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Screenings</span>
              <Layers className="h-4 w-4 text-zinc-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{totalScreenings}</div>
              <p className="text-[9px] text-zinc-650 mt-1">All database records</p>
            </div>
          </Card>

          {/* Approved Screenings */}
          <Card className="border-zinc-900 bg-zinc-950/40 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Approved</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500/80" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{approvedScreenings}</div>
              <p className="text-[9px] text-zinc-650 mt-1">Live on discovery page</p>
            </div>
          </Card>

          {/* Pending Submissions */}
          <Card className="border-zinc-900 bg-zinc-950/40 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Pending</span>
              <AlertTriangle className="h-4 w-4 text-amber-500/80" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{pendingSubmissions}</div>
              <p className="text-[9px] text-zinc-650 mt-1">Awaiting moderation</p>
            </div>
          </Card>

          {/* Rejected Submissions */}
          <Card className="border-zinc-900 bg-zinc-950/40 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Rejected</span>
              <XCircle className="h-4 w-4 text-red-500/80" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{rejectedSubmissions}</div>
              <p className="text-[9px] text-zinc-650 mt-1">Declined listings</p>
            </div>
          </Card>

          {/* Total Venues */}
          <Card className="border-zinc-900 bg-zinc-950/40 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Venues</span>
              <MapPin className="h-4 w-4 text-zinc-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{totalVenues}</div>
              <p className="text-[9px] text-zinc-650 mt-1">Unique physical host venues</p>
            </div>
          </Card>

          {/* Total User Reports */}
          <Card className="border-zinc-900 bg-zinc-950/40 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">User Reports</span>
              <FileText className="h-4 w-4 text-red-400/80" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{totalReports}</div>
              <p className="text-[9px] text-zinc-650 mt-1">Flagged by community</p>
            </div>
          </Card>

        </div>
      </div>

      {/* SECTION 2: Community Activity */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Community Activity
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Top Cities List (5 cols) */}
          <div className="md:col-span-5 w-full">
            <Card className="border-zinc-900 bg-zinc-950/40 p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                <Globe className="h-4 w-4 text-zinc-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Top Cities</h3>
              </div>

              {topCities.length > 0 ? (
                <div className="space-y-4 pt-1">
                  {topCities.slice(0, 10).map((city, idx) => (
                    <div key={city.name} className="flex items-center justify-between text-[11px] border-b border-zinc-900/40 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-600 font-bold w-4">{idx + 1}.</span>
                        <span className="font-semibold text-zinc-200">{city.name}</span>
                      </div>
                      <div className="flex gap-4 text-right">
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">Approved Screenings</span>
                          <span className="font-mono font-bold text-white text-xs">{city.approved}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase tracking-wider font-semibold">Submissions</span>
                          <span className="font-mono font-bold text-zinc-400 text-xs">{city.total}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-zinc-650 text-center py-6">No city data available.</p>
              )}
            </Card>
          </div>

          {/* Top Venues List (7 cols) */}
          <div className="md:col-span-7 w-full">
            <Card className="border-zinc-900 bg-zinc-950/40 p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                <MapPin className="h-4 w-4 text-zinc-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Top Venues</h3>
              </div>

              {topVenues.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider font-bold text-[9px]">
                        <th className="py-2 px-1 w-8">Rank</th>
                        <th className="py-2 px-2">Venue Name</th>
                        <th className="py-2 px-2">City</th>
                        <th className="py-2 px-2 text-right">Number of Screenings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/40 text-zinc-400">
                      {topVenues.slice(0, 8).map((venue, idx) => (
                        <tr key={`${venue.name}-${venue.city}`} className="hover:bg-zinc-900/10 transition-colors">
                          <td className="py-2.5 px-1 font-mono text-zinc-600 font-bold">{idx + 1}.</td>
                          <td className="py-2.5 px-2 font-semibold text-zinc-200">{venue.name}</td>
                          <td className="py-2.5 px-2 text-zinc-500">{venue.city}</td>
                          <td className="py-2.5 px-2 text-right font-mono font-bold text-white">{venue.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-[10px] text-zinc-650 text-center py-6">No venue data available.</p>
              )}
            </Card>
          </div>

          {/* Most Shared Screenings Table (12 cols) */}
          <div className="md:col-span-12 w-full">
            <Card className="border-zinc-900 bg-zinc-950/40 p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                <Share2 className="h-4 w-4 text-zinc-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Most Shared Screenings</h3>
              </div>

              {mostShared.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider font-bold text-[9px]">
                        <th className="py-2 px-2">Match Name</th>
                        <th className="py-2 px-2">Venue Name</th>
                        <th className="py-2 px-2 text-center">WhatsApp Shares</th>
                        <th className="py-2 px-2 text-center">Copy Link Shares</th>
                        <th className="py-2 px-2 text-center">Native Shares</th>
                        <th className="py-2 px-2 text-right">Total Shares</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/40 text-zinc-400">
                      {mostShared.slice(0, 10).map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-900/10 transition-colors">
                          <td className="py-2.5 px-2 font-semibold text-zinc-200 max-w-[200px] truncate">{item.matchName}</td>
                          <td className="py-2.5 px-2 text-zinc-500">{item.venueName}</td>
                          <td className="py-2.5 px-2 text-center">
                            <span className="inline-flex items-center gap-1 justify-center w-full">
                              <MessageSquare className="h-3.5 w-3.5 text-emerald-600/70 shrink-0" />
                              <span className="font-mono text-zinc-350">{item.whatsapp}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span className="inline-flex items-center gap-1 justify-center w-full">
                              <LinkIcon className="h-3.5 w-3.5 text-blue-500/70 shrink-0" />
                              <span className="font-mono text-zinc-350">{item.copyLink}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span className="inline-flex items-center gap-1 justify-center w-full">
                              <Smartphone className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                              <span className="font-mono text-zinc-350">{item.native}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono font-bold text-emerald-400 text-xs">{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-[10px] text-zinc-650 text-center py-8">
                  No share metrics recorded yet. Share screening pages to populate.
                </p>
              )}
            </Card>
          </div>

        </div>
      </div>

      {/* SECTION 3: Growth Metrics */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Growth Metrics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Last 7 Days */}
          <Card className="border-zinc-900 bg-zinc-950/40 p-5 space-y-4">
            <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Last 7 Days Activity
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-zinc-900/60 rounded p-3 bg-zinc-950/20">
                <span className="text-[9px] text-zinc-550 uppercase font-bold block">New Submissions</span>
                <span className="text-lg font-bold text-white font-mono mt-0.5 block">{last7Days.newSubmissions}</span>
              </div>
              <div className="border border-zinc-900/60 rounded p-3 bg-zinc-950/20">
                <span className="text-[9px] text-zinc-550 uppercase font-bold block">Approved Listings</span>
                <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">{last7Days.approved}</span>
              </div>
              <div className="border border-zinc-900/60 rounded p-3 bg-zinc-950/20">
                <span className="text-[9px] text-zinc-550 uppercase font-bold block">Rejected Listings</span>
                <span className="text-lg font-bold text-red-400 font-mono mt-0.5 block">{last7Days.rejected}</span>
              </div>
              <div className="border border-zinc-900/60 rounded p-3 bg-zinc-950/20">
                <span className="text-[9px] text-zinc-550 uppercase font-bold block">User Reports</span>
                <span className="text-lg font-bold text-zinc-300 font-mono mt-0.5 block">{last7Days.userReports}</span>
              </div>
            </div>
          </Card>

          {/* Last 30 Days */}
          <Card className="border-zinc-900 bg-zinc-950/40 p-5 space-y-4">
            <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Last 30 Days Activity
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-zinc-900/60 rounded p-3 bg-zinc-950/20">
                <span className="text-[9px] text-zinc-550 uppercase font-bold block">New Submissions</span>
                <span className="text-lg font-bold text-white font-mono mt-0.5 block">{last30Days.newSubmissions}</span>
              </div>
              <div className="border border-zinc-900/60 rounded p-3 bg-zinc-950/20">
                <span className="text-[9px] text-zinc-550 uppercase font-bold block">Approved Listings</span>
                <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">{last30Days.approved}</span>
              </div>
              <div className="border border-zinc-900/60 rounded p-3 bg-zinc-950/20">
                <span className="text-[9px] text-zinc-550 uppercase font-bold block">Rejected Listings</span>
                <span className="text-lg font-bold text-red-400 font-mono mt-0.5 block">{last30Days.rejected}</span>
              </div>
              <div className="border border-zinc-900/60 rounded p-3 bg-zinc-950/20">
                <span className="text-[9px] text-zinc-550 uppercase font-bold block">User Reports</span>
                <span className="text-lg font-bold text-zinc-300 font-mono mt-0.5 block">{last30Days.userReports}</span>
              </div>
            </div>
          </Card>

        </div>
      </div>

      {/* SECTION 4: Traffic Analytics (Cloudflare Integration) */}
      <Card className="border-zinc-900 bg-zinc-950/40 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Traffic Analytics
          </h3>
          <p className="text-[10px] text-zinc-550">
            Powered by Cloudflare Web Analytics
          </p>
          <p className="text-[11px] text-zinc-500 leading-relaxed max-w-xl">
            Traffic, visitors, referrers, top pages, geography, and browser telemetry are managed directly within Cloudflare.
          </p>
        </div>
        <a 
          href="https://dash.cloudflare.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <button className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 transition-colors cursor-pointer">
            Open Cloudflare Analytics
            <ExternalLink className="h-3 w-3" />
          </button>
        </a>
      </Card>

    </div>
  );
}
