/**
 * The small amount of request handling both endpoints need.
 *
 * `functions/_lib` is ignored by the Pages router — a leading underscore keeps
 * the directory from becoming `/api/_lib/http` — so shared code can live beside
 * the routes that use it.
 */

/** Beacons and form posts from our own pages; nothing else has a reason to call. */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // `sendBeacon` omits it on same-origin requests.
  return origin === new URL(request.url).origin;
}

/** A body big enough to matter is a body worth refusing before parsing it. */
const MAX_BODY = 2048;

export async function jsonBody<T>(request: Request): Promise<T | undefined> {
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > MAX_BODY) return undefined;

  const raw = await request.text();
  if (raw.length > MAX_BODY) return undefined;

  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as T) : undefined;
  } catch {
    return undefined;
  }
}

/** These endpoints have nothing to tell a caller, including why it was refused. */
export const noContent = (): Response => new Response(null, { status: 204 });

export const rejected = (): Response => new Response(null, { status: 400 });
