import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { RelayDialog } from '@/components/RelayDialog';
import { useAppContext } from '@/hooks/useAppContext';
import type { ReviewReport } from '@/lib/appReviews';
import { cn } from '@/lib/utils';

/**
 * Header control that reports where ratings are being read from and opens the
 * relay picker. It observes the shared ratings query without enabling it, so
 * pages that never read ratings show the relay count and nothing more.
 *
 * The pool swallows a failing relay and returns what the rest had, so an
 * unreachable relay set arrives as an empty result rather than an error. Both
 * are reported, because "live" would otherwise be claimed over nothing.
 */
export function RelayBadge({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { config } = useAppContext();
  const q = useQuery<ReviewReport[]>({ queryKey: ['nostr', 'app-reviews', 'all'], enabled: false });

  const relays = config.relayMetadata.relays.filter((r) => r.read).length;
  const state = q.isFetching
    ? 'reading'
    : q.isError
      ? 'failed'
      : q.data === undefined
        ? 'idle'
        : q.data.length === 0
          ? 'empty'
          : 'live';

  const label =
    state === 'reading'
      ? 'reading'
      : state === 'failed'
        ? 'no answer'
        : state === 'empty'
          ? config.liveOnly
            ? 'no ratings'
            : 'snapshot'
          : state === 'live'
            ? config.liveOnly
              ? 'live only'
              : 'live'
            : null;

  const title =
    state === 'failed' || state === 'empty'
      ? config.liveOnly
        ? 'These relays returned no ratings, and the crawl snapshot is switched off'
        : 'These relays returned no ratings; showing the crawl snapshot'
      : `Ratings read from ${relays} ${relays === 1 ? 'relay' : 'relays'}. Click to change.`;

  const attention = state === 'failed' || state === 'empty' || state === 'idle';
  // "live" is what the violet dot already says, so it gives way first when space is short.
  const expendable = state === 'live' && !config.liveOnly;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        title={title}
        className={cn(
          'inline-flex h-7 shrink-0 items-center gap-2 rounded-[4px] border px-2.5 font-mono text-[11px] whitespace-nowrap tracking-[0.12em] uppercase transition-colors',
          'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
          attention
            ? 'border-border text-muted-foreground hover:border-muted-foreground/60'
            : 'border-primary/40 text-primary hover:border-primary hover:bg-primary/10',
          className,
        )}
      >
        <span className="live-dot" data-state={state === 'reading' ? 'reading' : undefined} aria-hidden="true" />
        <span>
          {label && <span className={cn(expendable && 'hidden xl:inline')}>{label} · </span>}
          {relays} {relays === 1 ? 'relay' : 'relays'}
        </span>
        <ChevronDown className="size-3" aria-hidden="true" />
      </button>
      <RelayDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
