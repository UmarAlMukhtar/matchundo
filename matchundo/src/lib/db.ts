import { prisma } from './prisma';
import { Screening as PrismaScreening, Prisma } from '@prisma/client';

export interface Screening {
  id: string;
  match_name: string;
  venue_name: string;
  city: string;
  address: string;
  screening_datetime: string;
  description: string;
  poster_image_url: string;
  google_maps_link: string;
  created_at?: string;
}

// Mapper to convert Prisma models back to the snake_case frontend interface
function mapPrismaToScreening(s: PrismaScreening): Screening {
  return {
    id: s.id,
    match_name: s.matchName,
    venue_name: s.venueName,
    city: s.city,
    address: s.address,
    screening_datetime: s.screeningDatetime.toISOString(),
    description: s.description || '',
    poster_image_url: s.posterImageUrl || '',
    google_maps_link: s.googleMapsLink || '',
    created_at: s.createdAt.toISOString()
  };
}

export const db = {
  // Fetch all screenings sorted by date
  async getScreenings(): Promise<Screening[]> {
    try {
      const items = await prisma.screening.findMany({
        orderBy: {
          screeningDatetime: 'asc'
        }
      });
      return items.map(mapPrismaToScreening);
    } catch (error) {
      console.error('Error fetching screenings from Prisma:', error);
      return [];
    }
  },

  // Fetch single screening by ID
  async getScreeningById(id: string): Promise<Screening | null> {
    try {
      const s = await prisma.screening.findUnique({
        where: { id }
      });
      return s ? mapPrismaToScreening(s) : null;
    } catch (error) {
      console.error(`Error fetching screening ${id} from Prisma:`, error);
      return null;
    }
  },

  // Create new screening
  async createScreening(data: Omit<Screening, 'id'>): Promise<Screening | null> {
    try {
      const s = await prisma.screening.create({
        data: {
          matchName: data.match_name,
          venueName: data.venue_name,
          city: data.city,
          address: data.address,
          screeningDatetime: new Date(data.screening_datetime),
          description: data.description || null,
          posterImageUrl: data.poster_image_url || null,
          googleMapsLink: data.google_maps_link || null
        }
      });
      return mapPrismaToScreening(s);
    } catch (error) {
      console.error('Error creating screening in Prisma:', error);
      return null;
    }
  },

  // Update existing screening
  async updateScreening(id: string, data: Partial<Omit<Screening, 'id'>>): Promise<Screening | null> {
    try {
      const updateData: Prisma.ScreeningUpdateInput = {};
      if (data.match_name !== undefined) updateData.matchName = data.match_name;
      if (data.venue_name !== undefined) updateData.venueName = data.venue_name;
      if (data.city !== undefined) updateData.city = data.city;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.screening_datetime !== undefined) updateData.screeningDatetime = new Date(data.screening_datetime);
      if (data.description !== undefined) updateData.description = data.description || null;
      if (data.poster_image_url !== undefined) updateData.posterImageUrl = data.poster_image_url || null;
      if (data.google_maps_link !== undefined) updateData.googleMapsLink = data.google_maps_link || null;

      const s = await prisma.screening.update({
        where: { id },
        data: updateData
      });
      return mapPrismaToScreening(s);
    } catch (error) {
      console.error(`Error updating screening ${id} in Prisma:`, error);
      return null;
    }
  },

  // Delete screening
  async deleteScreening(id: string): Promise<boolean> {
    try {
      await prisma.screening.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error(`Error deleting screening ${id} in Prisma:`, error);
      return false;
    }
  }
};
