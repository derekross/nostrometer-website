import { nip19 } from 'nostr-tools';
import {
  TRACKED_NIPS,
  aggregateReviews,
  median,
  ratingToTier,
  type CompatTier,
  type ReviewReport,
  type TierAggregate,
} from '@/lib/appReviews';
import { APP_HANDLER_KIND, type AppInfo } from '@/lib/apps';
import type { ClaimedData, MetricsData } from '@/lib/staticData';

/**
 * The client × NIP matrix. Mirrors the semantics of the nostrometer tooling's
 * gen_matrix.py: one row per rated listing address, one cell per rated NIP,
 * median rating → tier, self-ratings flagged, rows ordered by real usage.
 */

export interface MatrixCell {
  tier: CompatTier;
  /** Median of the ratings in this cell. */
  rating: number;
  /** Distinct rater pubkeys. */
  raters: number;
  /** Every rater is the listing's own publisher: a self-rating, not verification. */
  selfOnly: boolean;
}

export interface MatrixRow {
  /** `31990:<pubkey>:<d>` — the coordinate the ratings target. */
  address: string;
  pubkey: string;
  identifier: string;
  /** Stable naddr (no relay hints) for routing. */
  naddr: string;
  /** The live listing, when the relays returned one. */
  app: AppInfo | null;
  name: string;
  overall: TierAggregate | null;
  cells: Map<string, MatrixCell>;
  /** Distinct monthly authors; `null` = unknown, never 0. */
  mau: number | null;
  /** NIPs whose markers were found in the client's source (unverified). */
  claimed: Set<string>;
  /** Distinct rater pubkeys across every NIP. */
  raters: number;
}

export const TRACKED_NIP_IDS = TRACKED_NIPS.map((n) => n.id);

/** Parse `31990:<pubkey>:<d>`; null when malformed or not a 31990 coordinate. */
export function parseAddress(address: string): { pubkey: string; identifier: string } | null {
  const [kind, pubkey, ...rest] = address.split(':');
  if (kind !== String(APP_HANDLER_KIND) || !/^[0-9a-f]{64}$/.test(pubkey ?? '')) return null;
  return { pubkey, identifier: rest.join(':') };
}

/** Human fallback when no listing metadata is available: the d-tag. */
function fallbackName(identifier: string, pubkey: string): string {
  return identifier || pubkey.slice(0, 8);
}

export function buildMatrix(
  reviews: ReviewReport[],
  apps: AppInfo[],
  metrics: MetricsData | undefined,
  claimed: ClaimedData | undefined,
): MatrixRow[] {
  const appByAddress = new Map<string, AppInfo>();
  for (const app of apps) appByAddress.set(app.address, app);

  const byAddress = new Map<string, ReviewReport[]>();
  for (const review of reviews) {
    const list = byAddress.get(review.appAddress) ?? [];
    list.push(review);
    byAddress.set(review.appAddress, list);
  }

  const rows: MatrixRow[] = [];
  for (const [address, list] of byAddress) {
    const parsed = parseAddress(address);
    if (!parsed) continue;
    const { pubkey, identifier } = parsed;

    const cells = new Map<string, MatrixCell>();
    const byNip = new Map<string, ReviewReport[]>();
    for (const r of list) {
      const group = byNip.get(r.nip) ?? [];
      group.push(r);
      byNip.set(r.nip, group);
    }
    for (const [nip, group] of byNip) {
      const med = median(group.map((r) => r.rating));
      const raters = new Set(group.map((r) => r.authorPubkey));
      cells.set(nip, {
        tier: ratingToTier(med),
        rating: med,
        raters: raters.size,
        selfOnly: [...raters].every((pk) => pk === pubkey),
      });
    }

    const app = appByAddress.get(address) ?? null;
    const metricsEntry = metrics?.byAddress[address];
    const name = app?.name || metricsEntry?.name || fallbackName(identifier, pubkey);

    rows.push({
      address,
      pubkey,
      identifier,
      naddr: nip19.naddrEncode({ kind: APP_HANDLER_KIND, pubkey, identifier }),
      app,
      name,
      overall: aggregateReviews(list).overall,
      cells,
      mau: metricsEntry?.mau ?? null,
      claimed: new Set(claimed?.byAddress[address]?.nips ?? []),
      raters: new Set(list.map((r) => r.authorPubkey)).size,
    });
  }

  return rows.sort(
    (a, b) => (b.mau ?? 0) - (a.mau ?? 0) || a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }),
  );
}

/** Whether a row carries any signal at all (a verified cell or a claim). */
export function rowHasData(row: MatrixRow): boolean {
  return row.cells.size > 0 || row.claimed.size > 0;
}
