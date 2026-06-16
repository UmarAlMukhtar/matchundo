import { checkAdminAuth } from "@/app/actions";
import { db } from "@/lib/db";
import AdminPanel from "./AdminPanel";

// Force dynamic so cookies are checked fresh on every load
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const isAuthenticated = await checkAdminAuth();
  const screenings = await db.getScreenings();

  return (
    <AdminPanel
      initialAuthenticated={isAuthenticated}
      initialScreenings={screenings}
    />
  );
}
