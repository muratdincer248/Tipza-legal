import { isTrackedEvent } from '../../src/lib/events';
import { jsonBody, noContent, rejected, sameOrigin } from '../_lib/http';

/**
 * Collector for the seven events in `src/lib/events.ts`.
 *
 * Writes to Workers Analytics Engine, which is built for exactly this: cheap
 * high-volume writes, no rows to migrate, and a dataset that expires on its own
 * rather than becoming a table nobody remembers agreeing to keep. Nothing
 * written here identifies a visitor — the request's IP address is neither stored
 * nor hashed, because an event count does not need one.
 *
 * With no `EVENTS` binding the endpoint still answers 204. The site works before
 * the dataset is configured, and a failed beacon never surfaces to a reader.
 */
interface Env {
  EVENTS?: AnalyticsEngineDataset;
}

interface Payload {
  event?: unknown;
  path?: unknown;
  label?: unknown;
  value?: unknown;
}

const MAX_STRING = 120;

const text = (value: unknown): string =>
  typeof value === 'string' ? value.slice(0, MAX_STRING) : '';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return rejected();

  const payload = await jsonBody<Payload>(request);
  if (!payload) return rejected();

  const event = payload.event;
  if (!isTrackedEvent(event)) return rejected();

  env.EVENTS?.writeDataPoint({
    /* One index, which is what Analytics Engine samples on: keep it the event
       name so a rare event is never sampled away behind a common one. */
    indexes: [event],
    blobs: [event, text(payload.path), text(payload.label)],
    doubles: [typeof payload.value === 'number' && Number.isFinite(payload.value) ? payload.value : 1],
  });

  return noContent();
};
