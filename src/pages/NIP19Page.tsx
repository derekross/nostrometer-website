import { nip19 } from 'nostr-tools';
import { Navigate, useParams } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/Layout';
import { APP_HANDLER_KIND } from '@/lib/apps';
import { ARTICLE_KIND } from '@/hooks/useUpdates';
import { DEREK_PUBKEY_HEX } from '@/lib/site';
import NotFound from './NotFound';

/**
 * Root-level NIP-19 identifiers. App listings and Derek's updates redirect to
 * their canonical routes; profiles hand off to njump; everything else is 404.
 */
export function NIP19Page() {
  const { nip19: identifier } = useParams<{ nip19: string }>();

  if (!identifier) return <NotFound />;

  let decoded: nip19.DecodedResult;
  try {
    decoded = nip19.decode(identifier);
  } catch {
    return <NotFound />;
  }

  switch (decoded.type) {
    case 'naddr': {
      const { kind, pubkey, identifier: d } = decoded.data;
      // Re-encode without relay hints so the canonical URL is stable.
      const canonical = nip19.naddrEncode({ kind, pubkey, identifier: d });
      if (kind === APP_HANDLER_KIND) return <Navigate to={`/app/${canonical}`} replace />;
      if (kind === ARTICLE_KIND && pubkey === DEREK_PUBKEY_HEX) return <Navigate to={`/updates/${canonical}`} replace />;
      return <NotFound />;
    }
    case 'npub':
      return <ProfileHandoff npub={identifier} />;
    case 'nprofile':
      return <ProfileHandoff npub={nip19.npubEncode(decoded.data.pubkey)} />;
    default:
      return <NotFound />;
  }
}

function ProfileHandoff({ npub }: { npub: string }) {
  useSeoMeta({
    title: 'Profile · Nostrometer',
    description: 'Nostrometer does not render profiles. Open this key on njump.',
    // A hand-off, not content.
    robots: 'noindex, follow',
  });
  return (
    <Section>
      <p className="eyebrow">Profile</p>
      <h1 className="t-h2 mt-3">This site does not render profiles.</h1>
      <p className="mt-4 max-w-[65ch] text-lg text-muted-foreground">Open the key in a Nostr client or on njump.</p>
      <p className="mt-4 font-mono text-sm break-all">{npub}</p>
      <Button asChild className="mt-6">
        <a href={`https://njump.me/${npub}`} target="_blank" rel="noopener noreferrer">
          Open on njump
        </a>
      </Button>
    </Section>
  );
}
