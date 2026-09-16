import { APP_RELAYS } from '@/lib/appRelays';

/**
 * Relay URL handling for the "Reading from" picker.
 *
 * Everything here is pure so it can be unit tested without React or a relay.
 */

export interface KnownRelay {
  /** Normalised URL, with the trailing slash `new URL().toString()` produces. */
  url: string;
  /** Host, for display. */
  name: string;
}

/**
 * Normalise a relay URL typed by a person.
 *
 * `wss:` only: the page CSP is `connect-src 'self' blob: https: wss:`, so a
 * `ws://` relay would be blocked by the browser after we accepted it. A bare
 * host gains the scheme. Returns null when the input cannot be a relay.
 */
export function normalizeRelayUrl(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  const withScheme = /^[a-z]+:\/\//i.test(value) ? value : `wss://${value}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== 'wss:') return null;
    if (!url.hostname) return null;
    // Relay URLs carry no query or fragment.
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

/** Display form: no scheme, no trailing slash. */
export function relayHost(url: string): string {
  return url.replace(/^wss:\/\//i, '').replace(/\/+$/, '');
}

/** Whether two relay URLs point at the same relay. */
export function sameRelay(a: string, b: string): boolean {
  return (normalizeRelayUrl(a) ?? a) === (normalizeRelayUrl(b) ?? b);
}

/** The four relays the site ships with, as a fresh array. */
export function defaultRelays(): { url: string; read: boolean; write: boolean }[] {
  return APP_RELAYS.relays.map((r) => ({ ...r }));
}

/**
 * Relays offered as one-click additions. Deliberately short and known-good:
 * `nostr.band` is dead and `purplepag.es` only carries profiles and relay
 * lists, so neither is useful for reading ratings.
 */
export const KNOWN_RELAYS: KnownRelay[] = [
  'wss://relay.ditto.pub/',
  'wss://relay.dreamith.to/',
  'wss://nos.lol/',
  'wss://nostr.mom/',
  'wss://relay.damus.io/',
  'wss://relay.primal.net/',
].map((url) => ({ url, name: relayHost(url) }));

/** Known relays the given list does not already contain. */
export function suggestedRelays(current: { url: string }[]): KnownRelay[] {
  return KNOWN_RELAYS.filter((known) => !current.some((r) => sameRelay(r.url, known.url)));
}
