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
 */
export function RelayBadge({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { config } = useAppContext();
  const q = useQuery<ReviewReport[]>({ queryKey: ['nostr', 'app-reviews', 'all'], enabled: false });

  const relays = config.relayMetadata.relays.filter((r) => r.read).length;
  const state = q.isFetching ? 'reading' : q.isError ? 'failed' : 'live';
  const label = state === 'reading' ? 'reading' : state === 'failed' ? (config.liveOnly ? 'no answer' : 'snapshot') : config.liveOnly ? 'live only' : 'live';
  const title =
    state === 'failed'
      ? config.liveOnly
        ? 'The relays did not answer, and the crawl snapshot is switched off'
        : 'The relays did not answer; showing the crawl snapshot'
      : `Ratings read from ${relays} ${relays === 1 ? 'relay' : 'relays'}. Click to change.`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        title={title}
        className={cn(
          'inline-flex h-7 items-center gap-2 rounded-[4px] border px-2.5 font-mono text-[11px] tracking-[0.12em] uppercase transition-colors',
          'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
          state === 'failed'
            ? 'border-border text-muted-foreground hover:border-muted-foreground/60'
            : 'border-primary/40 text-primary hover:border-primary hover:bg-primary/10',
          className,
        )}
      >
        <span className="live-dot" data-state={state === 'reading' ? 'reading' : undefined} aria-hidden="true" />
        {label} · {relays} {relays === 1 ? 'relay' : 'relays'}
        <ChevronDown className="size-3" aria-hidden="true" />
      </button>
      <RelayDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
