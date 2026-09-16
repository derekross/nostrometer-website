import { describe, expect, it } from 'vitest';
import { formatMau, mauTitle } from './staticData';

describe('formatMau', () => {
  it('prints a count the crawl actually saw', () => {
    expect(formatMau(5184)).toBe('5,184');
    expect(formatMau(1)).toBe('1');
  });

  it('never prints zero, because zero and invisible are the same to this method', () => {
    expect(formatMau(0)).toBe('—');
  });

  it('treats an unmeasured app the same way', () => {
    expect(formatMau(null)).toBe('—');
    expect(formatMau(undefined)).toBe('—');
  });
});

describe('mauTitle', () => {
  it('explains an empty cell and stays quiet on a real count', () => {
    expect(mauTitle(0)).toMatch(/no users, no client tag/);
    expect(mauTitle(null)).toMatch(/does not sample/);
    expect(mauTitle(5184)).toBeUndefined();
  });
});
