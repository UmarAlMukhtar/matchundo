import { checkAdminAuth } from "@/app/actions";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import SubmissionsPanel from "./SubmissionsPanel";

// Force dynamic so authentication cookies are evaluated fresh on every request
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function AdminSubmissionsPage({ searchParams }: PageProps) {
  const isAuthenticated = await checkAdminAuth();
  
  if (!isAuthenticated) {
    redirect("/admin");
  }

  const params = await searchParams;
  const tab = params.tab || "pending";

  // Fetch all screenings (pending, approved, rejected)
  const screenings = await db.getScreenings();

  return (
    <SubmissionsPanel
      initialScreenings={screenings}
      initialTab={tab}
    />
  );
}
