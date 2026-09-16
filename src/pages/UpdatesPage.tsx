import { useSeoMeta } from '@unhead/react';
import { PageHeader, Section } from '@/components/Layout';
import { UpdateCard } from '@/components/UpdateCard';
import { useUpdates } from '@/hooks/useUpdates';
import { DEFAULT_OG_IMAGE, DEREK_NPUB, UPDATES_TAG } from '@/lib/site';

export default function UpdatesPage() {
  const description = 'Crawl dates, new apps, rule changes, and NIP revisions that shifted a score.';
  useSeoMeta({
    title: 'Updates · Nostrometer',
    description,
    ogTitle: 'What changed',
    ogDescription: description,
    ogImage: DEFAULT_OG_IMAGE,
    twitterCard: 'summary_large_image',
  });

  const updates = useUpdates();

  return (
    <>
      <PageHeader
        eyebrow="Updates"
        title={
          <>
            What <mark className="hl">changed</mark>.
          </>
        }
        lede={description}
      >
        <p className="mt-6 max-w-[65ch] text-base text-muted-foreground">
          Updates are long-form Nostr articles tagged <span className="font-mono">#{UPDATES_TAG}</span>. Follow{' '}
          <a href={`https://njump.me/${DEREK_NPUB}`} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
            Derek on Nostr
          </a>{' '}
          to get them in your own client.
        </p>
      </PageHeader>

      <Section className="pt-0 md:pt-0">
        {updates.isLoading && (
          <div className="grid gap-4 md:grid-cols-2" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-md border bg-card p-6">
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                <div className="mt-4 h-6 w-4/5 animate-pulse rounded bg-muted" />
                <div className="mt-3 h-4 w-full animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        )}
        {updates.isError && (
          <div className="rounded-md border border-dashed bg-card px-8 py-12 text-center text-muted-foreground">
            The relays did not answer.{' '}
            <button type="button" onClick={() => updates.refetch()} className="text-primary underline">
              Retry
            </button>
          </div>
        )}
        {updates.data && updates.data.length === 0 && (
          <div className="rounded-md border border-dashed bg-card px-8 py-12 text-center text-muted-foreground">
            No updates published yet.
          </div>
        )}
        {updates.data && updates.data.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {updates.data.map((e) => (
              <UpdateCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
