/**
 * Verifies a Cloudflare Turnstile token on the server side using Cloudflare's siteverify API.
 * 
 * @param token The Turnstile client response token.
 * @param ip Optional client IP address.
 * @returns A promise resolving to true if verified successfully, or false if verification fails.
 */
export async function verifyTurnstileToken(token?: string, ip?: string): Promise<boolean> {
  const isDev = process.env.NODE_ENV === "development";
  const secretKey = isDev 
    ? "1x0000000000000000000000000000000AA" 
    : (process.env.TURNSTILE_SECRET_KEY || "");
  
  if (!secretKey) {
    console.warn("[Turnstile] TURNSTILE_SECRET_KEY is not configured. Bypassing Turnstile verification.");
    return true;
  }
  
  if (!token) {
    return false;
  }
  
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
        remoteip: ip,
      }),
    });
    
    const data = await res.json();
    return !!data.success;
  } catch (error) {
    console.error("[Turnstile] Turnstile siteverify request failed:", error);
    return false;
  }
}
