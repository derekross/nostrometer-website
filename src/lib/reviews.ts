import type { NostrEvent } from '@nostrify/nostrify';
import {
  APP_REVIEW_KIND,
  REVIEW_LABEL,
  REVIEW_LABEL_NAMESPACE,
  parseReviewEvent,
  type ReviewReport,
} from '@/lib/appReviews';
import type { RatingSnapshot } from '@/lib/staticData';

/**
 * Where a rating came from. Live reads can be incomplete (a relay that is
 * slow, down, or simply never received the event); the crawl snapshot is the
 * floor and live is the ceiling.
 */

/** A rating's identity: one rater, one app, one NIP. Newer revisions replace older ones. */
export function reviewKey(r: Pick<ReviewReport, 'authorPubkey' | 'appAddress' | 'nip'>): string {
  return `${r.authorPubkey}:${r.appAddress}:${r.nip}`;
}

/**
 * Rebuild a ReviewReport from a crawl snapshot row. The crawler verified the
 * signature before storing it, so the synthesized event carries no `sig`.
 */
export function snapshotToReview(row: RatingSnapshot): ReviewReport | null {
  const event: NostrEvent = {
    id: row.id,
    pubkey: row.pubkey,
    kind: APP_REVIEW_KIND,
    created_at: row.created_at,
    content: row.content,
    sig: '',
    tags: [
      ['d', `${row.address}:${row.nip}`],
      ['a', row.address],
      ['t', row.nip],
      ['l', REVIEW_LABEL, REVIEW_LABEL_NAMESPACE],
      ['rating', String(row.rating)],
    ],
  };
  return parseReviewEvent(event);
}

export function snapshotToReviews(rows: RatingSnapshot[]): ReviewReport[] {
  return rows.map(snapshotToReview).filter((r): r is ReviewReport => r !== null);
}

/**
 * Union of every source, one report per (rater, app, NIP), newest wins,
 * sorted newest first. Order of inputs does not matter.
 */
export function mergeReviews(...sources: (ReviewReport[] | undefined)[]): ReviewReport[] {
  const latest = new Map<string, ReviewReport>();
  for (const list of sources) {
    for (const r of list ?? []) {
      const key = reviewKey(r);
      const prev = latest.get(key);
      if (!prev || r.createdAt > prev.createdAt) latest.set(key, r);
    }
  }
  return Array.from(latest.values()).sort((a, b) => b.createdAt - a.createdAt);
}
