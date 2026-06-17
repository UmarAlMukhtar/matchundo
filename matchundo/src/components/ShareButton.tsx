"use client";

import React, { useState, useEffect } from "react";
import { Link as LinkIcon, Check, Share2, MessageSquare, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { trackEvent } from "@/lib/analytics";

interface ShareButtonProps {
  screeningId: string;
  matchName: string;
  venueName: string;
  city: string;
  datetime: string;
}

export function ShareButton({
  screeningId,
  matchName,
  venueName,
  city,
  datetime
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isShareSupported, setIsShareSupported] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (typeof navigator !== "undefined" && !!navigator.share) {
      setTimeout(() => {
        setIsShareSupported(true);
      }, 0);
    }
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const triggerToast = (text: string, type: "success" | "error") => {
    setToast({ text, type });
  };

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/screenings/${screeningId}`;
    }
    return `https://matchundo.com/screenings/${screeningId}`;
  };

  const formatShareDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch {
      return "TBD";
    }
  };

  const handleCopyLink = async () => {
    const shareUrl = getShareUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      triggerToast("Link copied to clipboard", "success");
      trackEvent("copy_link", { screeningId, timestamp: new Date().toISOString() });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
      triggerToast("Failed to copy link", "error");
    }
  };

  const handleWhatsAppShare = () => {
    const shareUrl = getShareUrl();
    const formattedDate = formatShareDate(datetime);
    const message = `🏟️ ${matchName}

📍 ${venueName}, ${city}

📅 ${formattedDate}

Join this screening on MatchUndo:
${shareUrl}`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    trackEvent("whatsapp_share", { screeningId, timestamp: new Date().toISOString() });
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      const shareUrl = getShareUrl();
      const formattedDate = formatShareDate(datetime);
      try {
        await navigator.share({
          title: matchName,
          text: `Watch ${matchName} live at ${venueName}, ${city} on ${formattedDate}.`,
          url: shareUrl,
        });
        trackEvent("native_share", { screeningId, timestamp: new Date().toISOString() });
      } catch (err) {
        // ShareSheet cancellation is normal and returns AbortError, don't show toast for it
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Native share failed:", err);
        }
      }
    }
  };

  return (
    <>
      {/* Copy Link Button */}
      <Button
        onClick={handleCopyLink}
        variant="outline"
        className="flex items-center justify-center gap-1.5 h-9 border-zinc-900 text-zinc-400 hover:text-white px-3 text-xs font-semibold flex-1 sm:flex-initial"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-emerald-500 shrink-0" /> Copied!
          </>
        ) : (
          <>
            <LinkIcon className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Copy Link
          </>
        )}
      </Button>

      {/* WhatsApp Button */}
      <Button
        onClick={handleWhatsAppShare}
        variant="outline"
        className="flex items-center justify-center gap-1.5 h-9 border-zinc-900 text-zinc-400 hover:text-white px-3 text-xs font-semibold flex-1 sm:flex-initial"
      >
        <MessageSquare className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> WhatsApp
      </Button>

      {/* Native Share Button */}
      {isShareSupported && (
        <Button
          onClick={handleNativeShare}
          variant="outline"
          className="flex items-center justify-center gap-1.5 h-9 border-zinc-900 text-zinc-400 hover:text-white px-3 text-xs font-semibold flex-1 sm:flex-initial"
        >
          <Share2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Share
        </Button>
      )}

      {/* TOAST SYSTEM */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-xs font-semibold shadow-md bg-zinc-950 border-zinc-900 text-zinc-200">
            {toast.type === "success" ? (
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
        </div>
      )}
    </>
  );
}
