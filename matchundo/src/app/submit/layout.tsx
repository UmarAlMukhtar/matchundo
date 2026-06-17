import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit a Screening | MatchUndo",
  description: "Help the community find public match screenings in Kerala by submitting a watch party schedule.",
  alternates: {
    canonical: "/submit",
  },
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
