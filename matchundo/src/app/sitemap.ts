import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getVenuesFromScreenings } from "@/lib/venue";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://matchundo.vercel.app";

  // 1. Static Routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/screenings`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/venues`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  // 2. Dynamic Screening Detail Routes (Approved only)
  const approvedScreenings = await db.getApprovedScreenings();
  const screeningRoutes = approvedScreenings.map((s) => ({
    url: `${baseUrl}/screenings/${s.id}`,
    lastModified: s.created_at ? new Date(s.created_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // 3. Dynamic Venue Page Routes (Venues containing approved screenings)
  const venues = getVenuesFromScreenings(approvedScreenings);
  const venueRoutes = venues.map((v) => ({
    url: `${baseUrl}/venues/${v.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, [...screeningRoutes], ...venueRoutes].flat();
}
