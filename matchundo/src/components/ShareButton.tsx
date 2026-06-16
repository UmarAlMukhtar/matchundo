"use client";

import React, { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "./ui/button";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Ignored or logged silently as required by checklist
      }
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      className="flex items-center gap-2 h-11 px-5 border-zinc-850 hover:border-zinc-700"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-emerald-500" /> Copied!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4 text-emerald-500" /> Share Match
        </>
      )}
    </Button>
  );
}
