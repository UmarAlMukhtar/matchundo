'use server';

import { cookies } from 'next/headers';
import { db, Screening } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const ADMIN_COOKIE_NAME = 'matchundo_admin_token';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const AUTH_TOKEN = 'authenticated_matchundo_admin';

// Check if admin is currently authenticated
export async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return token === AUTH_TOKEN;
}

// Log admin in
export async function loginAdmin(password: string): Promise<{ success: boolean; error?: string }> {
  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, AUTH_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });
    return { success: true };
  }
  return { success: false, error: 'Incorrect admin password' };
}

// Log admin out
export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  revalidatePath('/admin');
}

// Action to create screening
export async function createScreeningAction(
  data: Omit<Screening, 'id'>
): Promise<{ success: boolean; screening?: Screening | null; error?: string }> {
  const isAuthenticated = await checkAdminAuth();
  if (!isAuthenticated) {
    return { success: false, error: 'Unauthorized. Please login.' };
  }

  // Input validation
  if (!data.match_name || !data.venue_name || !data.city || !data.address || !data.screening_datetime) {
    return { success: false, error: 'Missing required screening fields.' };
  }

  try {
    const result = await db.createScreening(data);
    if (result) {
      revalidatePath('/');
      revalidatePath('/screenings');
      revalidatePath('/admin');
      return { success: true, screening: result };
    }
    return { success: false, error: 'Failed to write screening to database.' };
  } catch (error) {
    console.error('Error creating screening:', error);
    return { success: false, error: 'Internal server error.' };
  }
}

// Action to update screening
export async function updateScreeningAction(
  id: string,
  data: Partial<Omit<Screening, 'id'>>
): Promise<{ success: boolean; screening?: Screening | null; error?: string }> {
  const isAuthenticated = await checkAdminAuth();
  if (!isAuthenticated) {
    return { success: false, error: 'Unauthorized. Please login.' };
  }

  try {
    const result = await db.updateScreening(id, data);
    if (result) {
      revalidatePath('/');
      revalidatePath('/screenings');
      revalidatePath(`/screenings/${id}`);
      revalidatePath('/admin');
      return { success: true, screening: result };
    }
    return { success: false, error: 'Failed to update screening in database.' };
  } catch (error) {
    console.error(`Error updating screening ${id}:`, error);
    return { success: false, error: 'Internal server error.' };
  }
}

// Action to delete screening
export async function deleteScreeningAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const isAuthenticated = await checkAdminAuth();
  if (!isAuthenticated) {
    return { success: false, error: 'Unauthorized. Please login.' };
  }

  try {
    const success = await db.deleteScreening(id);
    if (success) {
      revalidatePath('/');
      revalidatePath('/screenings');
      revalidatePath('/admin');
      return { success: true };
    }
    return { success: false, error: 'Failed to delete screening.' };
  } catch (error) {
    console.error(`Error deleting screening ${id}:`, error);
    return { success: false, error: 'Internal server error.' };
  }
}
