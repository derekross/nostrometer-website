import { describe, expect, it } from 'vitest';
import { KNOWN_RELAYS, defaultRelays, normalizeRelayUrl, relayHost, sameRelay, suggestedRelays } from './relays';

describe('normalizeRelayUrl', () => {
  it('adds wss:// to a bare host and always returns the trailing-slash form', () => {
    expect(normalizeRelayUrl('relay.example.com')).toBe('wss://relay.example.com/');
    expect(normalizeRelayUrl('  wss://relay.example.com  ')).toBe('wss://relay.example.com/');
    expect(normalizeRelayUrl('wss://relay.example.com/')).toBe('wss://relay.example.com/');
  });

  it('keeps a path but drops query and fragment', () => {
    expect(normalizeRelayUrl('wss://relay.example.com/inbox')).toBe('wss://relay.example.com/inbox');
    expect(normalizeRelayUrl('wss://relay.example.com/?x=1#y')).toBe('wss://relay.example.com/');
  });

  it('rejects every scheme but wss, because the CSP blocks them', () => {
    expect(normalizeRelayUrl('ws://relay.example.com')).toBeNull();
    expect(normalizeRelayUrl('http://relay.example.com')).toBeNull();
    expect(normalizeRelayUrl('https://relay.example.com')).toBeNull();
    expect(normalizeRelayUrl('javascript:alert(1)')).toBeNull();
  });

  it('rejects empty and unparseable input', () => {
    expect(normalizeRelayUrl('')).toBeNull();
    expect(normalizeRelayUrl('   ')).toBeNull();
    expect(normalizeRelayUrl('wss://')).toBeNull();
  });
});

describe('relayHost', () => {
  it('strips the scheme and the trailing slash', () => {
    expect(relayHost('wss://relay.ditto.pub/')).toBe('relay.ditto.pub');
    expect(relayHost('wss://relay.example.com/inbox')).toBe('relay.example.com/inbox');
  });
});

describe('sameRelay', () => {
  it('matches across trailing slash and missing scheme', () => {
    expect(sameRelay('wss://nos.lol', 'wss://nos.lol/')).toBe(true);
    expect(sameRelay('nos.lol', 'wss://nos.lol/')).toBe(true);
    expect(sameRelay('wss://nos.lol/', 'wss://nostr.mom/')).toBe(false);
  });
});

describe('suggestedRelays', () => {
  it('offers only relays the list does not already have', () => {
    const names = suggestedRelays(defaultRelays()).map((r) => r.name);
    expect(names).toEqual(['relay.damus.io', 'relay.primal.net']);
  });

  it('offers a default again once it is removed', () => {
    const withoutNosLol = defaultRelays().filter((r) => !sameRelay(r.url, 'wss://nos.lol/'));
    expect(suggestedRelays(withoutNosLol).map((r) => r.name)).toContain('nos.lol');
  });

  it('offers nothing when everything known is in use', () => {
    expect(suggestedRelays(KNOWN_RELAYS)).toEqual([]);
  });
});
