import React from "react";
import { redirect } from "next/navigation";
import { checkAdminAuth } from "@/app/actions";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { BarChart3, Database, ShieldAlert, CheckSquare, Layers, MapPin, Activity, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const isAuthenticated = await checkAdminAuth();
  
  if (!isAuthenticated) {
    redirect("/admin");
  }

  // Fetch all screenings and events
  const screenings = await db.getScreenings();
  const moderationEvents = await db.getModerationEvents();

  // Create id -> matchName mapping for logs table
  const screeningMap = new Map(screenings.map(s => [s.id, s.match_name]));

  // Metrics calculations
  const totalSubmissions = screenings.length;
  const approved = screenings.filter(s => s.status === "approved").length;
  const pending = screenings.filter(s => s.status === "pending").length;
  const rejected = screenings.filter(s => s.status === "rejected").length;

  const totalClosed = approved + rejected;
  const approvalRate = totalClosed > 0 ? Math.round((approved / totalClosed) * 100) : 100;

  // Extract unique venues count from approved screenings
  const venueSet = new Set(screenings.filter(s => s.status === "approved").map(s => s.venue_name.toLowerCase().trim()));
  const uniqueVenues = venueSet.size;

  // Submission growth by week (for last 4 weeks)
  const now = new Date();
  const getSubmissionsInInterval = (daysStart: number, daysEnd: number) => {
    const start = new Date(now.getTime() - daysStart * 24 * 60 * 60 * 1000);
    const end = new Date(now.getTime() - daysEnd * 24 * 60 * 60 * 1000);
    
    return screenings.filter(s => {
      const created = s.created_at ? new Date(s.created_at) : new Date();
      return created >= start && created < end;
    }).length;
  };

  const week1 = getSubmissionsInInterval(7, 0);   // Last 7 days
  const week2 = getSubmissionsInInterval(14, 7);  // 8-14 days ago
  const week3 = getSubmissionsInInterval(21, 14); // 15-21 days ago
  const week4 = getSubmissionsInInterval(28, 21); // 22-28 days ago

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Analytics & Product Metrics
          </h1>
          <p className="text-zinc-550 text-[11px] mt-0.5">
            Key database performance indices, approval rates, and moderation logs.
          </p>
        </div>
        <div className="text-[11px] text-zinc-500 font-semibold bg-zinc-950 border border-zinc-900 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-emerald-500" />
          <span>Real-time DB connection active</span>
        </div>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        
        {/* Total Submissions */}
        <Card className="border-zinc-900 bg-zinc-950/40 p-4">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Submissions</span>
            <Layers className="h-4 w-4 text-zinc-650" />
          </div>
          <div className="text-2xl font-bold text-white">{totalSubmissions}</div>
          <p className="text-[9px] text-zinc-500 mt-1">Approved, pending & rejected</p>
        </Card>

        {/* Pending Backlog */}
        <Card className="border-zinc-900 bg-zinc-950/40 p-4">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending Backlog</span>
            <ShieldAlert className="h-4 w-4 text-amber-500/80" />
          </div>
          <div className="text-2xl font-bold text-white">{pending}</div>
          <p className="text-[9px] text-zinc-500 mt-1">Awaiting moderation review</p>
        </Card>

        {/* Approval Rate */}
        <Card className="border-zinc-900 bg-zinc-950/40 p-4">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Approval Rate</span>
            <CheckSquare className="h-4 w-4 text-emerald-500/80" />
          </div>
          <div className="text-2xl font-bold text-white">{approvalRate}%</div>
          <p className="text-[9px] text-zinc-500 mt-1">{approved} approved, {rejected} rejected</p>
        </Card>

        {/* Unique Venues */}
        <Card className="border-zinc-900 bg-zinc-950/40 p-4">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Unique Venues</span>
            <MapPin className="h-4 w-4 text-zinc-650" />
          </div>
          <div className="text-2xl font-bold text-white">{uniqueVenues}</div>
          <p className="text-[9px] text-zinc-500 mt-1">Football screening locations</p>
        </Card>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-8">
        
        {/* Weekly Submissions chart card (left) */}
        <div className="md:col-span-4 w-full">
          <Card className="border-zinc-900 bg-zinc-950/40 p-5">
            <div className="flex items-center gap-1.5 mb-4 border-b border-zinc-900 pb-2">
              <BarChart3 className="h-4 w-4 text-zinc-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Weekly Submissions</h2>
            </div>
            
            <div className="space-y-4 pt-2">
              {/* Week 1 */}
              <div>
                <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                  <span>Week 1 (Current)</span>
                  <span className="font-bold">{week1}</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, week1 * 10)}%` }} />
                </div>
              </div>

              {/* Week 2 */}
              <div>
                <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                  <span>Week 2</span>
                  <span className="font-bold">{week2}</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-zinc-700 h-full rounded-full" style={{ width: `${Math.min(100, week2 * 10)}%` }} />
                </div>
              </div>

              {/* Week 3 */}
              <div>
                <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                  <span>Week 3</span>
                  <span className="font-bold">{week3}</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-zinc-700 h-full rounded-full" style={{ width: `${Math.min(100, week3 * 10)}%` }} />
                </div>
              </div>

              {/* Week 4 */}
              <div>
                <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                  <span>Week 4</span>
                  <span className="font-bold">{week4}</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-zinc-700 h-full rounded-full" style={{ width: `${Math.min(100, week4 * 10)}%` }} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Moderation audit log table (right) */}
        <div className="md:col-span-8 w-full">
          <Card className="border-zinc-900 bg-zinc-950/40 p-5 overflow-hidden">
            <div className="flex items-center gap-1.5 mb-4 border-b border-zinc-900 pb-2">
              <Clock className="h-4 w-4 text-zinc-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Moderation History Log</h2>
            </div>

            {moderationEvents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider font-bold">
                      <th className="py-2.5 px-2">Action</th>
                      <th className="py-2.5 px-2">Screening Name</th>
                      <th className="py-2.5 px-2">Timestamp</th>
                      <th className="py-2.5 px-2">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60 text-zinc-400">
                    {moderationEvents.slice(0, 10).map((event) => {
                      const screeningName = screeningMap.get(event.screening_id) || "Deleted Screening";
                      
                      let actionColor = "text-amber-500 bg-amber-950/10 border border-amber-900/20";
                      let actionLabel = "Submission Created";

                      if (event.action === "submission_approved") {
                        actionColor = "text-emerald-500 bg-emerald-950/10 border border-emerald-900/20";
                        actionLabel = "Approved";
                      } else if (event.action === "submission_rejected") {
                        actionColor = "text-red-400 bg-red-950/10 border border-red-900/20";
                        actionLabel = "Rejected";
                      }

                      return (
                        <tr key={event.id} className="hover:bg-zinc-900/10 transition-colors">
                          <td className="py-2.5 px-2 font-medium">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${actionColor}`}>
                              {actionLabel}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 font-semibold text-zinc-200 max-w-[150px] truncate">
                            {screeningName}
                          </td>
                          <td className="py-2.5 px-2 text-zinc-500">
                            {new Date(event.created_at).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </td>
                          <td className="py-2.5 px-2 text-zinc-500 max-w-[200px] truncate">
                            {event.notes || "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center rounded bg-zinc-950/20 border border-zinc-900/60">
                <p className="text-zinc-650">No moderation history recorded in the database.</p>
              </div>
            )}
          </Card>
        </div>

      </div>

      {/* Third Party Analytics Integration Info block */}
      <Card className="border-zinc-900 bg-zinc-950/40 p-5">
        <div className="flex gap-3 text-xs">
          <Database className="h-5 w-5 text-zinc-550 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-zinc-200">Third-Party Analytics Platform</h3>
            <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
              We track moderation milestones (user submissions, approvals, rejections) internally in the database. For page views, clicks, and search engine telemetry, general-purpose hook interfaces are pre-integrated in server component routing loaders. Connect a third-party metrics engine (such as Mixpanel or Vercel Analytics) inside <code className="text-zinc-400 font-mono">src/lib/analytics.ts</code> to instantly map external event charts.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
