import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | MatchUndo",
  description: "Learn how MatchUndo collects, uses, and safeguards information submitted to the platform.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col justify-start">
      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl mb-2">
        Privacy Policy
      </h1>
      <p className="text-zinc-500 text-[11px] mb-8">
        Last updated: June 17, 2026
      </p>

      <div className="space-y-6 text-xs text-zinc-400 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">
            1. Information We Collect
          </h2>
          <p>
            MatchUndo is a community directory platform. We collect information through screening submission forms:
          </p>
          <ul className="list-disc list-inside pl-2 space-y-1 text-zinc-500">
            <li><strong>Event Details:</strong> Match name, venue, city, physical address, event date and time, description, and location coordinates (via Google Maps links).</li>
            <li><strong>Attribution Data:</strong> Submitter name and optional email address to contact you regarding the status of your submission.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">
            2. How We Use Information
          </h2>
          <p>
            We use submitted information solely to operate, curate, and maintain the MatchUndo watch party index:
          </p>
          <ul className="list-disc list-inside pl-2 space-y-1 text-zinc-500">
            <li>To review and moderate public screening listings.</li>
            <li>To display active, approved sports watch parties in public directories, search pages, and sitemaps.</li>
            <li>To notify submitters when a listing has been published or requires edits.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">
            3. Analytics & Telemetry
          </h2>
          <p>
            We utilize lightweight server-side telemetry to monitor platform activity, including page view counters, general search query tracking, and submission event logs. We do not transmit or sell user behavior profiles to third-party advertising companies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">
            4. Cookies
          </h2>
          <p>
            MatchUndo does not employ tracking cookies for public readers. We use minimal browser cookies solely to authenticate authorized administrator dashboard sessions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">
            5. Data Retention
          </h2>
          <p>
            Approved screenings remain on our platform indefinitely as past historical listings unless deletion is requested. Rejected submissions are regularly purged from database tables. Attributed email addresses are stored securely and never shared.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">
            6. User Rights & Contact
          </h2>
          <p>
            If you wish to update, modify, correct, or permanently delete screening information you submitted or believe should be removed, please contact us at <code className="text-zinc-200">umar1868807@gmail.com</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
