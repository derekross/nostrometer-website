import type { RelayMetadata } from '@/contexts/AppContext';

/**
 * Relays the site reads ratings, listings and articles from. The site never
 * publishes, so "write" is nominal; it keeps the NPool routers happy.
 */
export const APP_RELAYS: RelayMetadata = {
  relays: [
    { url: 'wss://relay.ditto.pub/', read: true, write: true },
    { url: 'wss://relay.dreamith.to/', read: true, write: true },
    { url: 'wss://nos.lol/', read: true, write: true },
    { url: 'wss://nostr.mom/', read: true, write: true },
  ],
  updatedAt: 0,
};

/** Bare relay URLs, for build-time tooling that does not use the app pool. */
export const RELAY_URLS = APP_RELAYS.relays.map((r) => r.url.replace(/\/$/, ''));
