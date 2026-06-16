"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Next.js Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="max-w-md">
        <h1 className="text-xl font-bold tracking-tight text-white mb-2">Something went wrong</h1>
        <p className="text-xs text-zinc-500 mb-8 leading-relaxed">
          An unexpected error occurred while loading this page. Please try reloading.
        </p>
        <div className="flex justify-center gap-3">
          <Button
            onClick={() => reset()}
            variant="default"
            className="text-xs font-semibold"
          >
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" className="text-xs font-semibold">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
