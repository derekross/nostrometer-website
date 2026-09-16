import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';
import { ARTICLE_KIND, articleTag } from '@/hooks/useUpdates';

/** Stable naddr (no relay hints) for an update article. */
export function updateNaddr(event: NostrEvent): string {
  return nip19.naddrEncode({ kind: ARTICLE_KIND, pubkey: event.pubkey, identifier: articleTag(event, 'd') ?? '' });
}

export function updatePath(event: NostrEvent): string {
  return `/updates/${updateNaddr(event)}`;
}
