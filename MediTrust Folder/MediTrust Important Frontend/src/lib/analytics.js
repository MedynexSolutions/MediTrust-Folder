/**
 * Lightweight analytics utility. Dispatches custom events and queues them in
 * sessionStorage so a backend SDK can be wired in later without changing call sites.
 */
export function trackEvent(eventName, properties = {}) {
  const event = {
    name: eventName,
    properties: {
      ...properties,
      timestamp: new Date().toISOString(),
      path: typeof window !== 'undefined' ? window.location.pathname : undefined,
    },
  };

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('meditrust-analytics', { detail: event }));

    try {
      const queue = JSON.parse(sessionStorage.getItem('meditrust_analytics') || '[]');
      queue.push(event);
      sessionStorage.setItem('meditrust_analytics', JSON.stringify(queue.slice(-50)));
    } catch {
      // sessionStorage may be unavailable in private browsing
    }
  }

  if (import.meta.env.DEV) {
    console.info('[Analytics]', eventName, properties);
  }
}

export const AnalyticsEvents = {
  VIDEO_STARTED: 'Video Started',
  VIDEO_COMPLETED: 'Video Completed',
};
