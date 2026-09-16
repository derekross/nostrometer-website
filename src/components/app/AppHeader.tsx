import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TierBadge } from '@/components/matrix/TierBadge';
import { useAuthor } from '@/hooks/useAuthor';
import type { AppInfo } from '@/lib/apps';
import type { TierAggregate } from '@/lib/appReviews';
import { sanitizeUrl } from '@/lib/sanitizeUrl';
import { NOSTRHUB_URL } from '@/lib/site';
import { formatMau } from '@/lib/staticData';

interface AppHeaderProps {
  app: AppInfo | null;
  /** Fallback name when the listing has not loaded. */
  name: string;
  naddr: string;
  pubkey: string;
  overall: TierAggregate | null;
  mau: number | null;
  raters: number;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function AppHeader({ app, name, naddr, pubkey, overall, mau, raters }: AppHeaderProps) {
  const publisher = useAuthor(pubkey);
  const publisherName = publisher.data?.metadata?.name ?? publisher.data?.metadata?.display_name;
  const picture = sanitizeUrl(app?.picture);
  const website = sanitizeUrl(app?.website);

  return (
    <header className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 md:pt-16">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-card font-display text-2xl font-bold">
          {picture ? (
            <img src={picture} alt="" width={80} height={80} loading="lazy" referrerPolicy="no-referrer" className="size-full object-cover" />
          ) : (
            <span aria-hidden="true">{initials(name)}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="eyebrow mb-2">App report</p>
          <h1 className="t-h1 break-words">{name}</h1>
          {app?.about && <p className="mt-4 max-w-[65ch] text-lg leading-7 text-muted-foreground">{app.about}</p>}

          <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 text-base sm:grid-cols-4">
            <div>
              <dt className="eyebrow">Overall</dt>
              <dd className="mt-1">{overall ? <TierBadge tier={overall.tier} /> : <span className="text-muted-foreground">Unrated</span>}</dd>
            </div>
            <div>
              <dt className="eyebrow">Monthly authors</dt>
              <dd className="mt-1 font-mono text-xl font-semibold tabular-nums">{formatMau(mau)}</dd>
            </div>
            <div>
              <dt className="eyebrow">Raters</dt>
              <dd className="mt-1 font-mono text-xl font-semibold tabular-nums">{raters}</dd>
            </div>
            <div>
              <dt className="eyebrow">Platforms</dt>
              <dd className="mt-1 text-muted-foreground">{app?.platforms.length ? app.platforms.join(', ') : '—'}</dd>
            </div>
          </dl>

          <p className="mt-4 text-sm text-muted-foreground">
            Listing published by{' '}
            <span className="font-semibold text-foreground">{publisherName ?? `${pubkey.slice(0, 8)}…`}</span>
            {website && (
              <>
                {' · '}
                <a href={website} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                  {website.replace(/^https:\/\//, '').replace(/\/$/, '')}
                </a>
              </>
            )}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <a href={`${NOSTRHUB_URL}/${naddr}`} target="_blank" rel="noopener noreferrer">
                Rate on nostrhub.io <ExternalLink className="size-4" />
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={`https://njump.me/${naddr}`} target="_blank" rel="noopener noreferrer">
                View listing
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
