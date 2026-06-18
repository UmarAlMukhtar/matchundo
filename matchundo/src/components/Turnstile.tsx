"use client";

import React, { useEffect, useRef } from "react";

interface TurnstileInstance {
  render: (container: HTMLElement | string, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileInstance;
  }
}

interface TurnstileProps {
  onVerify: (token: string) => void;
}

// Define static variables outside the component to prevent react-hooks linter issues
// and ensure a stable, constant dependency footprint.
const isDev = process.env.NODE_ENV === "development";
const siteKey = isDev 
  ? "1x00000000000000000000AA" 
  : (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "");

export function Turnstile({ onVerify }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    // 1. Ensure global Turnstile script is loaded once
    if (!document.getElementById("turnstile-script")) {
      const script = document.createElement("script");
      script.id = "turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    // 2. Poll for the global turnstile object to mount it explicitly
    let active = true;
    let timer: NodeJS.Timeout;

    const tryRender = () => {
      if (!active) return;
      
      const isTurnstileAvailable = typeof window !== "undefined" && !!window.turnstile;
      const isContainerAvailable = !!containerRef.current;

      if (isTurnstileAvailable && window.turnstile && isContainerAvailable && siteKey) {
        try {
          if (widgetIdRef.current) {
            window.turnstile.remove(widgetIdRef.current);
          }
          
          widgetIdRef.current = window.turnstile.render(containerRef.current!, {
            sitekey: siteKey,
            theme: "dark",
            callback: (token: string) => {
              onVerify(token);
            },
          });
        } catch (err) {
          console.error("[Turnstile] Explicit render call failed:", err);
        }
      } else {
        timer = setTimeout(tryRender, 200);
      }
    };

    tryRender();

    return () => {
      active = false;
      clearTimeout(timer);
      if (widgetIdRef.current && typeof window !== "undefined" && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignore removal errors during unmounts
        }
      }
    };
  }, [onVerify]);

  return <div ref={containerRef} />;
}
