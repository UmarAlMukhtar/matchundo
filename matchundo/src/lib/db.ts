import { prisma } from './prisma';
import { Prisma } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type PrismaScreening = Prisma.ScreeningGetPayload<{}>;

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
  
  // Submission & Moderation fields
  status?: string;
  submitted_by_name?: string;
  submitted_by_email?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  sport?: string;
  competition?: string;
}

export interface Report {
  id: string;
  screening_id: string;
  reason: string;
  notes: string;
  created_at: string;
  status: string;
  screening_title?: string;
}

export interface ModerationEvent {
  id: string;
  screening_id: string;
  action: string;
  notes: string;
  created_at: string;
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
    created_at: s.createdAt.toISOString(),
    status: s.status,
    submitted_by_name: s.submittedByName || '',
    submitted_by_email: s.submittedByEmail || '',
    reviewed_at: s.reviewedAt?.toISOString() || '',
    reviewed_by: s.reviewedBy || '',
    sport: s.sport || '',
    competition: s.competition || ''
  };
}

export const db = {
  // Fetch ALL screenings sorted by date (e.g. for admin/listing fallback)
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

  // Fetch only APPROVED screenings sorted by date (for public listings)
  async getApprovedScreenings(): Promise<Screening[]> {
    try {
      const items = await prisma.screening.findMany({
        where: {
          status: 'approved'
        },
        orderBy: {
          screeningDatetime: 'asc'
        }
      });
      return items.map(mapPrismaToScreening);
    } catch (error) {
      console.error('Error fetching approved screenings from Prisma:', error);
      return [];
    }
  },

  // Fetch screenings by specific status (e.g. pending, rejected, approved) for moderation
  async getScreeningsByStatus(status: string): Promise<Screening[]> {
    try {
      const items = await prisma.screening.findMany({
        where: {
          status: status
        },
        orderBy: {
          screeningDatetime: 'asc'
        }
      });
      return items.map(mapPrismaToScreening);
    } catch (error) {
      console.error(`Error fetching screenings by status ${status} from Prisma:`, error);
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
          googleMapsLink: data.google_maps_link || null,
          status: data.status || 'approved',
          submittedByName: data.submitted_by_name || null,
          submittedByEmail: data.submitted_by_email || null,
          reviewedAt: data.reviewed_at ? new Date(data.reviewed_at) : null,
          reviewedBy: data.reviewed_by || null,
          sport: data.sport || null,
          competition: data.competition || null
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
      if (data.status !== undefined) updateData.status = data.status;
      if (data.submitted_by_name !== undefined) updateData.submittedByName = data.submitted_by_name || null;
      if (data.submitted_by_email !== undefined) updateData.submittedByEmail = data.submitted_by_email || null;
      if (data.reviewed_at !== undefined) updateData.reviewedAt = data.reviewed_at ? new Date(data.reviewed_at) : null;
      if (data.reviewed_by !== undefined) updateData.reviewedBy = data.reviewed_by || null;
      if (data.sport !== undefined) updateData.sport = data.sport || null;
      if (data.competition !== undefined) updateData.competition = data.competition || null;

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
  },

  // Moderation Event logger
  async createModerationEvent(screeningId: string, action: string, notes?: string): Promise<boolean> {
    try {
      await prisma.moderationEvent.create({
        data: {
          screeningId,
          action,
          notes: notes || null
        }
      });
      return true;
    } catch (error) {
      console.error(`Error logging moderation event for screening ${screeningId}:`, error);
      return false;
    }
  },

  // Fetch all moderation events
  async getModerationEvents(): Promise<ModerationEvent[]> {
    try {
      const items = await prisma.moderationEvent.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
      return items.map(e => ({
        id: e.id,
        screening_id: e.screeningId,
        action: e.action,
        notes: e.notes || '',
        created_at: e.createdAt.toISOString()
      }));
    } catch (error) {
      console.error('Error fetching moderation events from Prisma:', error);
      return [];
    }
  },

  // Create a user report for a screening
  async createReport(screeningId: string, reason: string, notes?: string): Promise<boolean> {
    try {
      await prisma.report.create({
        data: {
          screeningId,
          reason,
          notes: notes || null
        }
      });
      return true;
    } catch (error) {
      console.error(`Error logging user report for screening ${screeningId}:`, error);
      return false;
    }
  },

  // Fetch all reports (pending or resolved, sorted by date)
  async getReports(): Promise<Report[]> {
    try {
      const items = await prisma.report.findMany({
        include: {
          screening: {
            select: {
              matchName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return items.map(r => ({
        id: r.id,
        screening_id: r.screeningId,
        reason: r.reason,
        notes: r.notes || '',
        created_at: r.createdAt.toISOString(),
        status: r.status,
        screening_title: r.screening.matchName
      }));
    } catch (error) {
      console.error('Error fetching user reports from Prisma:', error);
      return [];
    }
  },

  // Dismiss a user report
  async dismissReport(id: string): Promise<boolean> {
    try {
      await prisma.report.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error(`Error deleting user report ${id} in Prisma:`, error);
      return false;
    }
  }
};
