// Memory store for rate limiting: key is "IP:action" -> array of epoch timestamps (ms)
const rateLimitStore = new Map<string, number[]>();

export interface RateLimitResult {
  success: boolean;
  error?: string;
}

/**
 * Checks if a given IP has exceeded its request limit for a specific action.
 * 
 * @param ip The client's IP address.
 * @param action The label of the action (e.g., 'public_submission').
 * @param limit The maximum number of allowed requests in the time window.
 * @param windowMs The time window in milliseconds.
 */
export function checkRateLimit(
  ip: string,
  action: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const key = `${ip}:${action}`;
  const timestamps = rateLimitStore.get(key) || [];

  // Filter out timestamps older than the window
  const activeTimestamps = timestamps.filter(ts => now - ts < windowMs);

  if (activeTimestamps.length >= limit) {
    return {
      success: false,
      error: "Too many requests. Please try again later.",
    };
  }

  activeTimestamps.push(now);
  rateLimitStore.set(key, activeTimestamps);

  return { success: true };
}
