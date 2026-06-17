import React from "react";
import type { Metadata } from "next";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | MatchUndo",
  description: "Get in touch with MatchUndo for general inquiries or to report incorrect/inappropriate content.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col justify-start">
      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl mb-2">
        Contact Us
      </h1>
      <p className="text-zinc-550 text-[11px] mb-8">
        Have questions or need to submit a report? Get in touch with our team.
      </p>

      <div className="space-y-8 text-xs text-zinc-400">
        
        {/* Contact Email Block */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-lg p-5 flex items-start gap-4">
          <div className="p-2 bg-zinc-950 border border-zinc-900 text-emerald-500 rounded-md shrink-0">
            <Mail className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-200">Email Address</h2>
            <p className="mt-1 text-zinc-500">For all inquiries, please reach out to us at:</p>
            <p className="mt-2 text-zinc-200 font-mono font-bold text-xs select-all">umar1868807@gmail.com</p>
          </div>
        </div>

        {/* Action Guidelines Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          
          {/* General Inquiries */}
          <div className="bg-zinc-950/20 border border-zinc-900 p-5 rounded-lg space-y-2">
            <h3 className="font-bold text-zinc-300 text-xs uppercase tracking-wide">
              General Inquiries
            </h3>
            <p className="text-zinc-500 leading-relaxed">
              If you have feedback, questions about our directory listings, or want to collaborate, drop us an email with the subject line <strong>&quot;General Inquiry&quot;</strong>. We strive to reply to all feedback within 48 hours.
            </p>
          </div>

          {/* Reporting Content */}
          <div className="bg-zinc-950/20 border border-zinc-900 p-5 rounded-lg space-y-2">
            <h3 className="font-bold text-zinc-300 text-xs uppercase tracking-wide">
              Reporting Content
            </h3>
            <p className="text-zinc-500 leading-relaxed">
              If you discover incorrect screening times, duplicate venue schedules, inappropriate descriptions, or outdated details, please send an email with the subject line <strong>&quot;Content Report&quot;</strong> and include the listing link.
            </p>
          </div>

        </div>

        {/* Verification Info Alert */}
        <div className="rounded-lg bg-zinc-950 border border-zinc-900 p-4 text-[11px] text-zinc-500 leading-relaxed">
          <p className="font-semibold text-zinc-350 mb-1">Looking to report a specific listing immediately?</p>
          You can do so directly by clicking the <strong>&quot;Report Listing&quot;</strong> button found at the bottom of any screening&apos;s detail page. This flags the item instantly in our admin dashboard for moderation.
        </div>

      </div>
    </div>
  );
}
