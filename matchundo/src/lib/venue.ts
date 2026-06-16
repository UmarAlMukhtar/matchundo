import { Screening } from "./db";

/**
 * Helper to slugify a text string (e.g. "Champions Sports Cafe" -> "champions-sports-cafe")
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
}

export interface VenueInfo {
  venueName: string;
  city: string;
  address: string;
  slug: string;
  googleMapsLink: string;
}

/**
 * Groups screenings by unique physical venue and generates stable, conflict-resolved slugs.
 * If a venue name is unique, its slug is slugify(venueName).
 * If there are duplicate venue names (e.g. in different cities), it appends the city to make them unique.
 */
export function getVenuesFromScreenings(screenings: Screening[]): VenueInfo[] {
  const venueGroups = new Map<string, { venueName: string; city: string; address: string; googleMapsLink: string }>();

  screenings.forEach((s) => {
    const key = `${s.venue_name.trim().toLowerCase()}|${s.city.trim().toLowerCase()}|${s.address.trim().toLowerCase()}`;
    if (!venueGroups.has(key)) {
      venueGroups.set(key, {
        venueName: s.venue_name.trim(),
        city: s.city.trim(),
        address: s.address.trim(),
        googleMapsLink: s.google_maps_link || ''
      });
    }
  });

  const venuesList = Array.from(venueGroups.values());

  // Sort deterministically to ensure stable slug suffix assignment
  venuesList.sort((a, b) => {
    const nameCompare = a.venueName.localeCompare(b.venueName);
    if (nameCompare !== 0) return nameCompare;
    const cityCompare = a.city.localeCompare(b.city);
    if (cityCompare !== 0) return cityCompare;
    return a.address.localeCompare(b.address);
  });

  // Count occurrences of each base slug to detect duplicates
  const baseSlugCounts = new Map<string, number>();
  venuesList.forEach((v) => {
    const base = slugify(v.venueName);
    baseSlugCounts.set(base, (baseSlugCounts.get(base) || 0) + 1);
  });

  const generatedSlugs = new Set<string>();

  // Generate unique, stable slugs
  return venuesList.map((v) => {
    const base = slugify(v.venueName);
    const count = baseSlugCounts.get(base) || 0;
    
    // Default to base slug. If there are name collisions, append city name.
    let slug = base;
    if (count > 1) {
      slug = slugify(`${v.venueName}-${v.city}`);
    }

    // Resolve any remaining collisions (e.g. same name and city, but different addresses)
    if (generatedSlugs.has(slug)) {
      let suffix = 2;
      let newSlug = `${slug}-${suffix}`;
      while (generatedSlugs.has(newSlug)) {
        suffix++;
        newSlug = `${slug}-${suffix}`;
      }
      slug = newSlug;
    }

    generatedSlugs.add(slug);

    return {
      venueName: v.venueName,
      city: v.city,
      address: v.address,
      googleMapsLink: v.googleMapsLink,
      slug
    };
  });
}

/**
 * Builds a fast lookup map from "venue_name|city|address" -> "slug"
 */
export function getVenueSlugMap(screenings: Screening[]): Map<string, string> {
  const venues = getVenuesFromScreenings(screenings);
  const map = new Map<string, string>();
  
  venues.forEach((v) => {
    const key = `${v.venueName.toLowerCase()}|${v.city.toLowerCase()}|${v.address.toLowerCase()}`;
    map.set(key, v.slug);
  });

  return map;
}

/**
 * Generates the lookup key for search queries
 */
export function getVenueSlugKey(venueName: string, city: string, address: string): string {
  return `${venueName.toLowerCase().trim()}|${city.toLowerCase().trim()}|${address.toLowerCase().trim()}`;
}
