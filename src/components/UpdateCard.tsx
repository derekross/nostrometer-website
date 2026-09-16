import { Link } from 'react-router-dom';
import type { NostrEvent } from '@nostrify/nostrify';
import { articlePublishedAt, articleTag } from '@/hooks/useUpdates';
import { updatePath } from '@/lib/updates';

export function UpdateCard({ event }: { event: NostrEvent }) {
  const title = articleTag(event, 'title') ?? 'Untitled';
  const summary = articleTag(event, 'summary');
  const published = new Date(articlePublishedAt(event) * 1000);
  return (
    <article className="flex flex-col rounded-md border bg-card p-6">
      <time dateTime={published.toISOString()} className="eyebrow">
        {published.toISOString().slice(0, 10)}
      </time>
      <h3 className="mt-3 text-xl font-bold leading-7">
        <Link to={updatePath(event)} className="hover:text-primary hover:underline">
          {title}
        </Link>
      </h3>
      {summary && <p className="mt-2 line-clamp-3 text-base leading-6 text-muted-foreground">{summary}</p>}
    </article>
  );
}
