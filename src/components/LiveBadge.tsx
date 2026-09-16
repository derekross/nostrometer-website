import { useQuery } from '@tanstack/react-query';
import type { ReviewReport } from '@/lib/appReviews';
import { APP_RELAYS } from '@/lib/appRelays';
import { cn } from '@/lib/utils';

/**
 * Header badge that mirrors the state of the live ratings read. It observes
 * the shared query without triggering it, so pages that never read ratings
 * show the relay count and nothing more.
 */
export function LiveBadge({ className }: { className?: string }) {
  const q = useQuery<ReviewReport[]>({ queryKey: ['app-reviews', 'all'], enabled: false });
  const relays = APP_RELAYS.relays.filter((r) => r.read).length;
  const state = q.isFetching ? 'reading' : q.isError ? 'snapshot' : q.data ? 'live' : 'idle';
  const text = state === 'reading' ? 'reading' : state === 'snapshot' ? 'snapshot' : 'live';
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center gap-2 rounded-[4px] border px-2.5 font-mono text-[11px] tracking-[0.12em] uppercase',
        state === 'snapshot' ? 'border-border text-muted-foreground' : 'border-primary/40 text-primary',
        className,
      )}
      title={state === 'snapshot' ? 'Live relays did not answer; showing the crawl snapshot' : `Ratings read live from ${relays} relays`}
    >
      <span className="live-dot" data-state={state} aria-hidden="true" />
      {text} · {relays} relays
    </span>
  );
}
