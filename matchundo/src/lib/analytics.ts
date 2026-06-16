/**
 * Reusable analytics interface for MatchUndo.
 * This provides hooks to easily integrate a third-party provider (e.g., Mixpanel, Google Analytics, Vercel Analytics) in the future.
 */

export interface AnalyticsProvider {
  trackPageView(url: string): void;
  trackEvent(name: string, properties?: Record<string, unknown>): void;
}

// ConsoleLoggerProvider is a default implementation for development environment measurement.
class ConsoleLoggerProvider implements AnalyticsProvider {
  trackPageView(url: string): void {
    console.log(`[Analytics - PageView] ${url}`);
  }

  trackEvent(name: string, properties?: Record<string, unknown>): void {
    console.log(`[Analytics - Event] ${name}`, properties);
  }
}

// Active provider instance (can switch to Vercel/Mixpanel/Google Analytics in production)
const activeProvider: AnalyticsProvider = new ConsoleLoggerProvider();

/**
 * Tracks a page view event.
 * @param url The current page route (e.g., '/', '/submit', '/screenings/123')
 */
export function trackPageView(url: string): void {
  try {
    activeProvider.trackPageView(url);
  } catch (error) {
    console.error("Failed to track page view:", error);
  }
}

/**
 * Tracks a custom event.
 * @param name Event name (e.g., 'search', 'filter_city', 'submission_success')
 * @param properties Key-value metadata about the event
 */
export function trackEvent(name: string, properties?: Record<string, unknown>): void {
  try {
    activeProvider.trackEvent(name, properties);
  } catch (error) {
    console.error(`Failed to track event "${name}":`, error);
  }
}
