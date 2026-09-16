import { describe, expect, it } from 'vitest';
import type { NostrEvent } from '@nostrify/nostrify';
import { buildMatrix, parseAddress } from './matrix';
import { parseReviewEvent, type ReviewReport } from './appReviews';
import { parseAppEvent, type AppInfo } from './apps';
import type { ClaimedData, MetricsData } from './staticData';

const DEV = 'a'.repeat(64);
const RATER = 'b'.repeat(64);
const OTHER = 'c'.repeat(64);
const ADDR = `31990:${DEV}:myapp`;
const DUP_ADDR = `31990:${OTHER}:myapp-dup`;

function review(pubkey: string, address: string, nip: string, rating: number): ReviewReport {
  const event: NostrEvent = {
    id: `${pubkey.slice(0, 4)}-${nip}-${rating}`,
    pubkey,
    kind: 31986,
    created_at: 1000,
    content: '',
    sig: '',
    tags: [
      ['d', `${address}:${nip}`],
      ['a', address],
      ['t', nip],
      ['l', 'nip-compatibility', 'borkstr'],
      ['rating', String(rating)],
    ],
  };
  const parsed = parseReviewEvent(event);
  if (!parsed) throw new Error('fixture failed to parse');
  return parsed;
}

function app(pubkey: string, d: string, name: string): AppInfo {
  const event: NostrEvent = {
    id: `app-${d}`,
    pubkey,
    kind: 31990,
    created_at: 1000,
    content: JSON.stringify({ name }),
    sig: '',
    tags: [['d', d]],
  };
  const parsed = parseAppEvent(event);
  if (!parsed) throw new Error('fixture failed to parse');
  return parsed;
}

const metrics: MetricsData = {
  relay: 'wss://relay.ditto.pub',
  metric: 'x',
  since: 1,
  until: 2,
  crawled_at: '2026-09-14T00:00:00+00:00',
  apps: 2,
  byAddress: {
    [ADDR]: { id: 'myapp', name: 'My App', mau: 42 },
    [DUP_ADDR]: { id: 'myapp', name: 'My App', mau: 42 },
  },
};

const claimed: ClaimedData = {
  generated_at: '2026-09-14T00:00:00+00:00',
  byAddress: { [ADDR]: { repo: 'https://example.com', nips: ['nip-57'] } },
};

describe('parseAddress', () => {
  it('accepts 31990 coordinates and keeps colons in the d tag', () => {
    expect(parseAddress(`31990:${DEV}:a:b`)).toEqual({ pubkey: DEV, identifier: 'a:b' });
  });
  it('rejects other kinds and malformed pubkeys', () => {
    expect(parseAddress(`30023:${DEV}:x`)).toBeNull();
    expect(parseAddress('31990:nothex:x')).toBeNull();
  });
});

describe('buildMatrix', () => {
  it('takes the median per NIP, averaging the middle pair on ties', () => {
    const rows = buildMatrix(
      [review(RATER, ADDR, 'nip-01', 1.0), review(OTHER, ADDR, 'nip-01', 0.3)],
      [app(DEV, 'myapp', 'My App')],
      metrics,
      claimed,
    );
    const cell = rows[0].cells.get('nip-01');
    expect(cell?.rating).toBeCloseTo(0.65);
    expect(cell?.tier).toBe('incomplete');
    expect(cell?.raters).toBe(2);
    expect(cell?.selfOnly).toBe(false);
  });

  it('flags a cell as selfOnly when every rater is the listing publisher', () => {
    const rows = buildMatrix(
      [review(DEV, ADDR, 'nip-17', 1.0), review(RATER, ADDR, 'nip-25', 1.0), review(DEV, ADDR, 'nip-25', 1.0)],
      [],
      metrics,
      claimed,
    );
    expect(rows[0].cells.get('nip-17')?.selfOnly).toBe(true);
    expect(rows[0].cells.get('nip-25')?.selfOnly).toBe(false);
    expect(rows[0].raters).toBe(2);
  });

  it('sorts by MAU descending with unknown MAU treated as 0, then by name', () => {
    const A = `31990:${DEV}:aaa`;
    const B = `31990:${DEV}:bbb`;
    const C = `31990:${DEV}:ccc`;
    const m: MetricsData = {
      ...metrics,
      byAddress: {
        [A]: { id: 'aaa', name: 'Zed', mau: null },
        [B]: { id: 'bbb', name: 'Alpha', mau: 0 },
        [C]: { id: 'ccc', name: 'Mid', mau: 5 },
      },
    };
    const rows = buildMatrix(
      [review(RATER, A, 'nip-01', 1), review(RATER, B, 'nip-01', 1), review(RATER, C, 'nip-01', 1)],
      [],
      m,
      undefined,
    );
    expect(rows.map((r) => r.name)).toEqual(['Mid', 'Alpha', 'Zed']);
    expect(rows[2].mau).toBeNull();
  });

  it('joins MAU through a merged duplicate address and falls back to the metrics name', () => {
    const rows = buildMatrix([review(RATER, DUP_ADDR, 'nip-01', 1)], [], metrics, claimed);
    expect(rows[0].mau).toBe(42);
    expect(rows[0].name).toBe('My App');
    expect(rows[0].app).toBeNull();
    expect(rows[0].claimed.size).toBe(0);
  });

  it('attaches claimed NIPs and the live listing when present', () => {
    const rows = buildMatrix([review(RATER, ADDR, 'nip-01', 0.1)], [app(DEV, 'myapp', 'Live Name')], metrics, claimed);
    expect(rows[0].name).toBe('Live Name');
    expect(rows[0].claimed.has('nip-57')).toBe(true);
    expect(rows[0].overall?.tier).toBe('borked');
    expect(rows[0].naddr.startsWith('naddr1')).toBe(true);
  });

  it('renders without static data at all', () => {
    const rows = buildMatrix([review(RATER, ADDR, 'nip-01', 1)], [], undefined, undefined);
    expect(rows[0].mau).toBeNull();
    expect(rows[0].name).toBe('myapp');
  });
});
