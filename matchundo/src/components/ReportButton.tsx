"use client";

import React, { useState } from "react";
import { ShieldAlert, Loader2, CheckCircle, AlertTriangle, X } from "lucide-react";
import { createReportAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Turnstile } from "@/components/Turnstile";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

interface ReportButtonProps {
  screeningId: string;
}

export function ReportButton({ screeningId }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("Incorrect Information");
  const [notes, setNotes] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsPending(true);

    try {
      const result = await createReportAction(screeningId, reason, notes.trim(), turnstileToken);
      if (result.success) {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          // reset states
          setIsSubmitted(false);
          setNotes("");
          setReason("Incorrect Information");
        }, 2000);
      } else {
        setErrorMsg(result.error || "Failed to submit report. Please try again.");
      }
    } catch {
      setErrorMsg("Failed to submit report. Please check your network connection.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-[10px] font-bold h-9 border-zinc-900 text-zinc-500 hover:text-red-400 hover:border-red-950/40 hover:bg-red-950/10 flex items-center justify-center gap-1.5 shrink-0 px-3"
      >
        <ShieldAlert className="h-3.5 w-3.5" /> Report Listing
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="w-full max-w-sm p-6 border-zinc-900 bg-zinc-950 relative">
            {/* Modal Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-zinc-900 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {isSubmitted ? (
              <div className="text-center py-6 flex flex-col items-center">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-950/20 text-emerald-500 border border-emerald-900/10 mb-4 animate-in zoom-in-50 duration-200">
                  <CheckCircle className="h-5 w-5" />
                </span>
                <CardTitle className="text-sm font-bold text-white mb-1">
                  Report Submitted
                </CardTitle>
                <CardDescription className="text-zinc-400 text-xs leading-relaxed">
                  Thank you. Our moderation team will review this listing shortly.
                </CardDescription>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="flex flex-col items-center text-center mb-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-900 text-zinc-400 mb-3">
                    <ShieldAlert className="h-4.5 w-4.5" />
                  </span>
                  <CardTitle className="text-sm font-bold text-white">
                    Report Listing
                  </CardTitle>
                  <CardDescription className="text-zinc-400 text-xs mt-1 leading-relaxed">
                    Flag incorrect, duplicate, or inappropriate watch party listing details.
                  </CardDescription>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-md px-2.5 py-1.5 text-xs text-white outline-none focus:border-zinc-800"
                  >
                    <option value="Incorrect Information">Incorrect Information</option>
                    <option value="Duplicate Listing">Duplicate Listing</option>
                    <option value="Inappropriate Content">Inappropriate Content</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Details / Notes
                  </label>
                  <Textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide additional details to help our moderation team review..."
                    className="w-full bg-zinc-950 border-zinc-900 text-xs"
                  />
                </div>

                {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                  <div className="py-2 border-t border-zinc-900/40">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                      Security Verification <span className="text-red-500">*</span>
                    </label>
                    <div className="flex justify-center">
                      <Turnstile onVerify={setTurnstileToken} />
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-2.5 bg-red-950/20 border border-red-900/10 text-red-400 rounded-md text-[10px] flex gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-900/60">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="border-zinc-900 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    variant="default"
                    size="sm"
                    className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin text-zinc-950 mr-1" /> Submitting...
                      </>
                    ) : (
                      "Submit Report"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
