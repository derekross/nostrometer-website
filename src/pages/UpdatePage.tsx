import { useSeoMeta } from '@unhead/react';
import { Link, useParams } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { Section } from '@/components/Layout';
import { MarkdownContent } from '@/components/MarkdownContent';
import { ArticleStructuredData, BreadcrumbStructuredData } from '@/components/StructuredData';
import { ARTICLE_KIND, articlePublishedAt, articleTag, useUpdate } from '@/hooks/useUpdates';
import { sanitizeUrl } from '@/lib/sanitizeUrl';
import { DEFAULT_OG_IMAGE, DEREK_PUBKEY_HEX } from '@/lib/site';
import NotFound from '@/pages/NotFound';

function decodeUpdate(naddr: string | undefined): string | null {
  if (!naddr) return null;
  try {
    const decoded = nip19.decode(naddr);
    if (decoded.type !== 'naddr' || decoded.data.kind !== ARTICLE_KIND) return null;
    // Only Derek's articles are part of this feed.
    if (decoded.data.pubkey !== DEREK_PUBKEY_HEX) return null;
    return decoded.data.identifier;
  } catch {
    return null;
  }
}

export default function UpdatePage() {
  const { naddr } = useParams<{ naddr: string }>();
  const identifier = decodeUpdate(naddr);
  if (identifier === null) return <NotFound />;
  return <UpdateArticle identifier={identifier} naddr={naddr!} />;
}

function UpdateArticle({ identifier, naddr }: { identifier: string; naddr: string }) {
  const update = useUpdate(identifier);
  const event = update.data;
  const title = event ? (articleTag(event, 'title') ?? 'Untitled') : 'Update';
  const summary = event ? articleTag(event, 'summary') : undefined;
  const image = event ? sanitizeUrl(articleTag(event, 'image')) : undefined;

  useSeoMeta({
    title: `${title} · Nostrometer`,
    description: summary ?? 'A Nostrometer update.',
    ogTitle: title,
    ogDescription: summary ?? 'A Nostrometer update.',
    ogImage: image ?? DEFAULT_OG_IMAGE,
    ogType: 'article',
    twitterCard: 'summary_large_image',
  });

  if (update.isFetched && !event) return <NotFound />;

  return (
    <Section>
      {event && (
        <>
          <ArticleStructuredData
            headline={title}
            description={summary}
            published={articlePublishedAt(event)}
            path={`/updates/${naddr}`}
            image={image}
          />
          <BreadcrumbStructuredData
            trail={[
              { name: 'Updates', path: '/updates' },
              { name: title, path: `/updates/${naddr}` },
            ]}
          />
        </>
      )}
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
        <Link to="/updates" className="hover:text-foreground hover:underline">
          Updates
        </Link>
      </nav>

      {update.isLoading && (
        <div aria-busy="true">
          <h1 className="sr-only">Loading update</h1>
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="mt-4 h-12 w-3/4 animate-pulse rounded bg-muted" />
          <div className="mt-8 h-4 w-full animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-muted" />
        </div>
      )}

      {update.isError && (
        <div className="rounded-md border border-dashed bg-card px-8 py-12 text-center text-muted-foreground">
          <h1 className="t-h3 mb-2 text-foreground">Update unavailable</h1>
          The relays did not answer.{' '}
          <button type="button" onClick={() => update.refetch()} className="text-primary underline">
            Retry
          </button>
        </div>
      )}

      {event && (
        <article>
          <header className="max-w-[65ch]">
            <time dateTime={new Date(articlePublishedAt(event) * 1000).toISOString()} className="eyebrow">
              {new Date(articlePublishedAt(event) * 1000).toISOString().slice(0, 10)}
            </time>
            <h1 className="t-h1 mt-4">{title}</h1>
            {summary && <p className="mt-6 text-xl leading-8 text-muted-foreground">{summary}</p>}
          </header>
          {image && (
            <img
              src={image}
              alt={title}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="mt-8 max-w-[65ch] rounded-md border"
            />
          )}
          <div className="mt-10">
            <MarkdownContent event={event} />
          </div>
          <p className="mt-12 text-sm text-muted-foreground">
            <a href={`https://njump.me/${naddr}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
              Open on Nostr
            </a>
          </p>
        </article>
      )}
    </Section>
  );
}
