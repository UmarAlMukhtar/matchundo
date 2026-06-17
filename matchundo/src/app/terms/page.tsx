import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | MatchUndo",
  description: "Review user guidelines, submission rules, and terms of service for MatchUndo.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col justify-start">
      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl mb-2">
        Terms & Conditions
      </h1>
      <p className="text-zinc-500 text-[11px] mb-8">
        Last updated: June 17, 2026
      </p>

      <div className="space-y-6 text-xs text-zinc-400 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">
            1. User Responsibilities
          </h2>
          <p>
            By accessing and using MatchUndo, you agree to use the service only for lawful purposes and in accordance with these Terms. You are responsible for verifying all event and scheduling details with the hosting venue before attending any screening.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">
            2. Accuracy & Submissions
          </h2>
          <p>
            MatchUndo relies on community-submitted events. When submitting a screening listing:
          </p>
          <ul className="list-disc list-inside pl-2 space-y-1 text-zinc-500">
            <li>You agree to provide true, accurate, and current details regarding the match name, venue location, city, and time.</li>
            <li>You represent that you have obtained any necessary permission from the venue owners/administrators to publicize the watch party.</li>
            <li>You acknowledge that MatchUndo is under no obligation to publish or maintain any submission and may reject listings at its discretion.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">
            3. Prohibited Content
          </h2>
          <p>
            We enforce a zero-tolerance policy for misleading, harmful, or inappropriate submissions. Prohibited content includes:
          </p>
          <ul className="list-disc list-inside pl-2 space-y-1 text-zinc-500">
            <li>Fraudulent or mock listings with intent to mislead users.</li>
            <li>Promotional text containing offensive, graphic, or discriminatory language.</li>
            <li>Use of official logos, copyright materials, or trademarks without permission.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">
            4. Limitation of Liability
          </h2>
          <p>
            MatchUndo is an independent discovery platform. We do not host, organize, or manage any of the screenings listed on this site.
          </p>
          <p className="text-zinc-500">
            Under no circumstances shall MatchUndo, its administrators, or contributors be held liable for any damages, losses, travel costs, entry fees, or disappointments resulting from event cancellations, scheduling changes, venue closures, or incorrect information.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">
            5. Platform Availability
          </h2>
          <p>
            We provide this directory service &quot;as is&quot; and &quot;as available&quot; without warranties of any kind. We reserve the right to modify, suspend, or discontinue the platform at any time without prior notice.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">
            6. Right to Remove Content
          </h2>
          <p>
            We reserve the right, but do not assume the obligation, to inspect user reports and remove any screening, venue link, or detail page from public view immediately and without notice if we believe it violates our terms.
          </p>
        </section>
      </div>
    </div>
  );
}
