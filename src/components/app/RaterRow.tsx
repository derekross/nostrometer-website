import { useAuthor } from '@/hooks/useAuthor';
import { TierBadge } from '@/components/matrix/TierBadge';
import type { ReviewReport } from '@/lib/appReviews';
import { sanitizeUrl } from '@/lib/sanitizeUrl';

interface RaterRowProps {
  review: ReviewReport;
  /** The listing's publisher; a matching rater is a self-rating. */
  appPubkey: string;
}

function formatDate(seconds: number): string {
  return new Date(seconds * 1000).toISOString().slice(0, 10);
}

export function RaterRow({ review, appPubkey }: RaterRowProps) {
  const author = useAuthor(review.authorPubkey);
  const meta = author.data?.metadata;
  const name = meta?.name ?? meta?.display_name ?? `${review.authorPubkey.slice(0, 8)}…`;
  const picture = sanitizeUrl(meta?.picture);
  const isSelf = review.authorPubkey === appPubkey;

  return (
    <li className="flex gap-3 py-3">
      <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted text-xs font-semibold">
        {picture ? (
          <img src={picture} alt="" width={32} height={32} loading="lazy" referrerPolicy="no-referrer" className="size-full object-cover" />
        ) : (
          <span aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <a
            href={`https://njump.me/${review.authorPubkey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground hover:text-primary hover:underline"
          >
            {name}
          </a>
          <TierBadge tier={review.tier} size="sm" />
          {isSelf && (
            <span className="rounded-md border border-dashed px-1.5 py-0.5 font-mono text-xs text-muted-foreground">Self-rated</span>
          )}
          <time dateTime={new Date(review.createdAt * 1000).toISOString()} className="ml-auto font-mono text-xs text-muted-foreground tabular-nums">
            {formatDate(review.createdAt)}
          </time>
        </div>
        {review.content.trim() && <p className="mt-1.5 text-base leading-6 whitespace-pre-wrap break-words">{review.content}</p>}
      </div>
    </li>
  );
}
