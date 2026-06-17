import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer | MatchUndo",
  description: "Read the legal disclaimer regarding third-party trademarks, event organization, and user verification.",
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col justify-start">
      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl mb-2">
        Disclaimer
      </h1>
      <p className="text-zinc-500 text-[11px] mb-8">
        Last updated: June 17, 2026
      </p>

      <div className="space-y-6 text-xs text-zinc-400 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">
            1. Independent Community Platform
          </h2>
          <p>
            MatchUndo is an independent community directory platform designed to help sports enthusiasts discover public sports match screenings and watch parties. 
          </p>
          <p className="text-zinc-500 font-medium">
            MatchUndo is not affiliated with, endorsed by, or sponsored by FIFA, the FIFA World Cup, the Indian Premier League (IPL), the Indian Super League (ISL), UEFA, or any specific sports league, tournament organiser, athletic club, team, or athletic governing body.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">
            2. Event Hosting & Organization
          </h2>
          <p>
            MatchUndo does not organize, host, sponsor, manage, or guarantee any of the screenings or events listed in this directory. We have no control over the venues, entry requirements, screening equipment, broadcast quality, or scheduling choices of the individual venues.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">
            3. User-Submitted Information
          </h2>
          <p>
            The majority of the screening information displayed on this website is submitted by members of the community. While we review submissions for spam and general coherence, we do not verify the truth, accuracy, or timing of individual listings.
          </p>
          <p>
            Event timings, entry fees, screening availability, and locations may change at any time without notice. We strongly recommend that users contact or verify event details directly with the venues before traveling to attend.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">
            4. Trademark Fair Use
          </h2>
          <p>
            All matches, tournaments, team names, league names, and trademarks mentioned on this platform are the property of their respective owners. Mention of these names is for descriptive purposes only (nominative fair use) to identify the sports matches being screened at local venues and does not imply any connection or endorsement.
          </p>
        </section>
      </div>
    </div>
  );
}
