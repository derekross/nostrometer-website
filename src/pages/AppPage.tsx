import { useMemo } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Link, useParams } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { RefreshCw } from 'lucide-react';
import { Gauge } from '@/components/Gauge';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/app/AppHeader';
import { NipRatingList } from '@/components/app/NipRatingList';
import { NipStrip } from '@/components/app/NipStrip';
import { Readouts } from '@/components/app/Readouts';
import { useAuthor } from '@/hooks/useAuthor';
import { useReviewsForApp } from '@/hooks/useReviews';
import { useApp } from '@/hooks/useRatedApps';
import { useClaimed, useMetrics } from '@/hooks/useStaticData';
import { GIT_REPO_KIND, repoLabel } from '@/lib/repos';
import { APP_HANDLER_KIND } from '@/lib/apps';
import { TIERS, aggregateReviews } from '@/lib/appReviews';
import { sanitizeUrl } from '@/lib/sanitizeUrl';
import { DEFAULT_OG_IMAGE } from '@/lib/site';
import { formatUtc } from '@/lib/staticData';
import NotFound from '@/pages/NotFound';

function decodeApp(naddr: string | undefined): { pubkey: string; identifier: string } | null {
  if (!naddr) return null;
  try {
    const decoded = nip19.decode(naddr);
    if (decoded.type !== 'naddr' || decoded.data.kind !== APP_HANDLER_KIND) return null;
    return { pubkey: decoded.data.pubkey, identifier: decoded.data.identifier };
  } catch {
    return null;
  }
}

export default function AppPage() {
  const { naddr } = useParams<{ naddr: string }>();
  const target = decodeApp(naddr);
  if (!target) return <NotFound />;
  return <AppReport pubkey={target.pubkey} identifier={target.identifier} />;
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 text-sm leading-5">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}

function AppReport({ pubkey, identifier }: { pubkey: string; identifier: string }) {
  const address = `${APP_HANDLER_KIND}:${pubkey}:${identifier}`;
  const canonicalNaddr = nip19.naddrEncode({ kind: APP_HANDLER_KIND, pubkey, identifier });

  const app = useApp(pubkey, identifier);
  const reviews = useReviewsForApp(address);
  const metrics = useMetrics();
  const claimed = useClaimed();
  const publisher = useAuthor(pubkey);

  const metricsEntry = metrics.data?.byAddress[address];
  const claimedSet = useMemo(() => new Set(claimed.data?.byAddress[address]?.nips ?? []), [claimed.data, address]);
  const name = app.data?.name || metricsEntry?.name || identifier;
  const overall = useMemo(() => (reviews.reviews ? aggregateReviews(reviews.reviews).overall : null), [reviews.reviews]);
  const publisherName = publisher.data?.metadata?.name ?? publisher.data?.metadata?.display_name;
  const website = sanitizeUrl(app.data?.website);
  const repo = repoLabel(app.data?.repoRefs ?? [], claimed.data?.byAddress[address]?.repo ?? null);

  const description = `NIP-by-NIP interoperability ratings for ${name} on Nostrometer.`;
  useSeoMeta({
    title: `${name} · Nostrometer`,
    description,
    ogTitle: `${name}: NIP compatibility`,
    ogDescription: description,
    ogImage: DEFAULT_OG_IMAGE,
    twitterCard: 'summary_large_image',
  });

  const hasAny = reviews.reviews && (reviews.reviews.length > 0 || claimedSet.size > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-20 sm:px-6">
      <nav aria-label="Breadcrumb" className="font-mono text-sm text-muted-foreground">
        <Link to="/results" className="hover:text-foreground hover:underline">
          Results
        </Link>{' '}
        / <span className="text-foreground">{name}</span>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="min-w-0">
          <AppHeader app={app.data ?? null} name={name} naddr={canonicalNaddr} />

          <div className="mt-10">
            <Readouts mau={metricsEntry?.mau ?? null} reviews={reviews.reviews} />
          </div>

          {reviews.reviews && (
            <div className="mt-4">
              <NipStrip reviews={reviews.reviews} appPubkey={pubkey} claimed={claimedSet} appName={name} />
            </div>
          )}

          <div className="mt-12">
            <p className="eyebrow mb-4">Ratings by NIP</p>

            {reviews.isLoading && (
              <div className="space-y-3" aria-busy="true">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 border-b py-3">
                    <div className="h-5 w-10 animate-pulse rounded bg-muted" />
                    <div className="h-5 w-48 animate-pulse rounded bg-muted" />
                    <div className="ml-auto h-8 w-28 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            )}

            {reviews.isError && (
              <div className="rounded-md border border-dashed bg-card px-8 py-12 text-center">
                <p className="text-lg font-semibold">The relays did not answer.</p>
                <Button className="mt-4" onClick={() => reviews.refetch()}>
                  <RefreshCw className="size-4" /> Retry
                </Button>
              </div>
            )}

            {reviews.liveFailed && (
              <p className="mb-4 rounded-md border border-dashed bg-card px-4 py-3 text-sm text-muted-foreground">
                Live relays did not answer; showing the crawl snapshot{reviews.snapshotDate ? ` from ${formatUtc(reviews.snapshotDate)}` : ''}.{' '}
                <button type="button" onClick={() => reviews.refetch()} className="text-primary underline">
                  Retry
                </button>
              </p>
            )}

            {reviews.reviews && !hasAny && (
              <div className="rounded-md border border-dashed bg-card px-8 py-12 text-center text-muted-foreground">
                No ratings published for this listing yet. Be the first on NostrHub.
              </div>
            )}

            {hasAny && <NipRatingList reviews={reviews.reviews!} appPubkey={pubkey} claimed={claimedSet} />}
          </div>

          <p className="mt-10 font-mono text-xs break-all text-muted-foreground">{address}</p>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
          <div className="flex flex-col items-center rounded-md border bg-card p-6">
            <p className="eyebrow self-start">Overall</p>
            <Gauge
              value={overall?.rating ?? 0}
              label={overall ? TIERS[overall.tier].label : reviews.isLoading ? 'Reading…' : 'Unrated'}
              caption={overall ? `median of ${new Set(reviews.reviews?.map((r) => r.nip)).size} per-NIP medians` : undefined}
              size={280}
              className="max-w-full"
            />
          </div>
          <div className="rounded-md border bg-card p-6">
            <p className="eyebrow">Listing</p>
            <div className="mt-3 flex flex-col gap-2">
              <Fact label="Published by" value={publisherName ?? `${pubkey.slice(0, 8)}…`} />
              <Fact label="Platforms" value={app.data?.platforms.length ? app.data.platforms.join(', ') : '—'} />
              <Fact
                label="Website"
                value={
                  website ? (
                    <a href={website} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                      {website.replace(/^https:\/\//, '').replace(/\/$/, '')}
                    </a>
                  ) : (
                    '—'
                  )
                }
              />
              <Fact
                label="Repository"
                value={
                  repo.kind === 'nostr' ? (
                    <a
                      href={`https://njump.me/${nip19.naddrEncode({ kind: GIT_REPO_KIND, pubkey: repo.ref.pubkey, identifier: repo.ref.identifier })}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2"
                    >
                      On Nostr
                    </a>
                  ) : repo.kind === 'web' ? (
                    <span>
                      <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                        {repo.host}
                      </a>
                      <span className="text-muted-foreground"> · </span>
                      <Link to="/developers#ngit" className="text-muted-foreground underline underline-offset-2">
                        not on Nostr yet
                      </Link>
                    </span>
                  ) : (
                    <Link to="/developers#ngit" className="text-muted-foreground underline underline-offset-2">
                      not announced
                    </Link>
                  )
                }
              />
              <Fact label="Claimed in code" value={claimedSet.size ? `${claimedSet.size} NIPs` : '—'} />
            </div>
          </div>
          <div className="rounded-md border border-dashed bg-card p-6">
            <p className="eyebrow">Move a cell</p>
            <p className="mt-2 text-sm leading-5 text-muted-foreground">
              Disagree with a tier? Publish your own rating with a note. The median moves; self-ratings are marked until confirmed.{' '}
              <Link to="/developers" className="text-primary underline underline-offset-2">
                How
              </Link>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
