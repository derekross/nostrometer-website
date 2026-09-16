/**
 * Shapes of the static JSON the site serves from /data, produced by
 * scripts/sync-data.sh from the nostrometer tooling's crawl outputs.
 */

export interface MetricsEntry {
  /** Registry slug. */
  id: string;
  name: string;
  /** Distinct monthly authors; `null` when the query failed or was never run. */
  mau: number | null;
}

export interface MetricsData {
  relay: string | null;
  metric: string | null;
  /** Window start (unix seconds). */
  since: number | null;
  /** Window end (unix seconds). */
  until: number | null;
  /** ISO timestamp of the crawl. */
  crawled_at: string | null;
  /** Apps in the registry (spam excluded). */
  apps: number;
  /** Keyed by `31990:<pubkey>:<d>`, including merged duplicate listings. */
  byAddress: Record<string, MetricsEntry>;
}

export interface ClaimedEntry {
  repo: string | null;
  /** NIP ids (e.g. `nip-17`) whose markers were found in the client's source. */
  nips: string[];
}

export interface ClaimedData {
  generated_at: string;
  byAddress: Record<string, ClaimedEntry>;
}

export interface RatingSnapshot {
  id: string;
  pubkey: string;
  created_at: number;
  /** `31990:<pubkey>:<d>` */
  address: string;
  nip: string;
  rating: number;
  content: string;
}

export interface RatingsData {
  crawled_at: string | null;
  count: number;
  ratings: RatingSnapshot[];
}

const EMPTY_RATINGS: RatingsData = { crawled_at: null, count: 0, ratings: [] };

const EMPTY_METRICS: MetricsData = {
  relay: null,
  metric: null,
  since: null,
  until: null,
  crawled_at: null,
  apps: 0,
  byAddress: {},
};

const EMPTY_CLAIMED: ClaimedData = { generated_at: '', byAddress: {} };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function fetchJson(path: string, signal?: AbortSignal): Promise<unknown> {
  const res = await fetch(path, { signal, headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

/** Fetch /data/metrics.json; a missing file resolves to an empty dataset. */
export async function fetchMetrics(signal?: AbortSignal): Promise<MetricsData> {
  try {
    const data = await fetchJson('/data/metrics.json', signal);
    if (!isRecord(data) || !isRecord(data.byAddress)) return EMPTY_METRICS;
    return { ...EMPTY_METRICS, ...(data as Partial<MetricsData>), byAddress: data.byAddress as Record<string, MetricsEntry> };
  } catch {
    return EMPTY_METRICS;
  }
}

/** Fetch /data/claimed.json; a missing file resolves to an empty dataset. */
export async function fetchClaimed(signal?: AbortSignal): Promise<ClaimedData> {
  try {
    const data = await fetchJson('/data/claimed.json', signal);
    if (!isRecord(data) || !isRecord(data.byAddress)) return EMPTY_CLAIMED;
    return { ...EMPTY_CLAIMED, ...(data as Partial<ClaimedData>), byAddress: data.byAddress as Record<string, ClaimedEntry> };
  } catch {
    return EMPTY_CLAIMED;
  }
}

/** Fetch /data/ratings.json; a missing file resolves to an empty snapshot. */
export async function fetchRatings(signal?: AbortSignal): Promise<RatingsData> {
  try {
    const data = await fetchJson('/data/ratings.json', signal);
    if (!isRecord(data) || !Array.isArray(data.ratings)) return EMPTY_RATINGS;
    return { ...EMPTY_RATINGS, ...(data as Partial<RatingsData>), ratings: data.ratings as RatingSnapshot[] };
  } catch {
    return EMPTY_RATINGS;
  }
}

/**
 * Format a usage count for display.
 *
 * Only a count the crawl actually saw is printed. Zero is not: a relay that
 * returned nothing and an app whose users publish where we do not look are
 * indistinguishable to this method, so printing `0` would assert something the
 * crawl never established. Apps that decline the `client` tag, and apps built
 * around closed or group relays, both land here legitimately.
 */
export function formatMau(mau: number | null | undefined): string {
  if (mau === null || mau === undefined || mau <= 0) return '—';
  return mau.toLocaleString('en-US');
}

/** Why a usage cell is empty, for a tooltip. */
export function mauTitle(mau: number | null | undefined): string | undefined {
  if (mau !== null && mau !== undefined && mau > 0) return undefined;
  return 'No activity seen for this app on the sampled relay. That can mean no users, no client tag, or an app whose users publish to relays this crawl does not sample.';
}

/** "2026-09-14 17:11 UTC" from an ISO timestamp; empty string when absent. */
export function formatUtc(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.toISOString().slice(0, 10)} ${d.toISOString().slice(11, 16)} UTC`;
}

/** "2026-09-14" from unix seconds. */
export function formatDay(seconds: number | null | undefined): string {
  if (!seconds) return '';
  return new Date(seconds * 1000).toISOString().slice(0, 10);
}
