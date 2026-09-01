import { isTrackedEvent, type TrackedEvent } from './events';

/**
 * Client-side event tracking.
 *
 * Cloudflare Web Analytics counts page views and web vitals and nothing else,
 * which answers "which articles get read" but not "what do readers do once they
 * are there". The seven events in `events.ts` answer the second question.
 *
 * Nothing here identifies a visitor: no cookie, no local identifier, no attempt
 * at a fingerprint. An event is a name, the page it happened on, and at most one
 * label — which is also why `Do Not Track` and Global Privacy Control are
 * honoured outright rather than negotiated with.
 */
export type { TrackedEvent };

export interface TrackedDetail {
  /** One short string, e.g. which button or which article. */
  label?: string;
  /** One number, e.g. a position in a list. */
  value?: number;
}

const ENDPOINT = '/api/event';

const optedOut = (): boolean => {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.globalPrivacyControl === true || nav.doNotTrack === '1';
};

/**
 * `sendBeacon` because most of these fire on a click that is about to unload the
 * page, and a normal `fetch` would be cancelled with it. Failure is silent: an
 * analytics call is never worth an error in a reader's console, and the endpoint
 * answers 204 whether or not a collector is configured behind it.
 */
export function track(event: TrackedEvent, detail: TrackedDetail = {}): void {
  if (optedOut()) return;

  const body = JSON.stringify({ event, path: location.pathname, ...detail });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
      return;
    }
    void fetch(ENDPOINT, {
      method: 'POST',
      body,
      headers: { 'content-type': 'application/json' },
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* Tracking never breaks the page it is measuring. */
  }
}

/**
 * Click tracking is declared in the markup — `data-track="toc_click"`, with an
 * optional `data-track-label` — and handled here by one delegated listener.
 * Components stay free of script tags, and instrumenting a new link is an
 * attribute rather than a bundle.
 *
 * Capture phase, so the beacon is queued before a navigation starts tearing the
 * document down.
 */
export function installClickTracking(): void {
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const trigger = target.closest<HTMLElement>('[data-track]');
      if (!trigger) return;

      const name = trigger.dataset.track;
      if (!isTrackedEvent(name)) return;

      track(name, { label: trigger.dataset.trackLabel });
    },
    { capture: true }
  );
}

/**
 * Fires once when the end of the article scrolls into view. A page view says the
 * headline worked; this says the article did.
 */
export function installReadTracking(): void {
  const end = document.querySelector('[data-article-end]');
  if (!end) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      track('article_read');
    },
    { rootMargin: '0px 0px -20% 0px' }
  );

  observer.observe(end);
}

/** Fires once when a desktop QR download block scrolls into view. */
export function installQrViewTracking(): void {
  const blocks = document.querySelectorAll<HTMLElement>('[data-qr-download]');
  if (!blocks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        observer.unobserve(el);
        track('qr_download_view', { label: el.dataset.qrDownload });
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.4 }
  );

  blocks.forEach((block) => observer.observe(block));
}
