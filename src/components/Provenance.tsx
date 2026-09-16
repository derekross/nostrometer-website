import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { MetricsData } from '@/lib/staticData';
import { formatDay, formatUtc } from '@/lib/staticData';
import { REPO_URL } from '@/lib/site';
import { cn } from '@/lib/utils';

interface ProvenanceProps {
  metrics: MetricsData | undefined;
  snapshotCount: number;
  snapshotDate: string | null;
  liveCount: number;
  isLive: boolean;
  liveOnly: boolean;
  /** Shown to the left of the trigger, on the same row. */
  hint?: React.ReactNode;
  className?: string;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[6.5rem_1fr] sm:gap-4">
      <dt className="eyebrow text-[11px]">{label}</dt>
      <dd className="text-sm leading-5 text-muted-foreground">{children}</dd>
    </div>
  );
}

const linkClass = 'text-foreground underline underline-offset-2 hover:text-primary';

/**
 * Where the numbers on this page came from. Collapsed by default: the trigger
 * carries the two facts worth seeing at a glance, and the detail is one click
 * away rather than a paragraph under every table.
 */
export function Provenance({ metrics, snapshotCount, snapshotDate, liveCount, isLive, liveOnly, hint, className }: ProvenanceProps) {
  const [open, setOpen] = useState(false);

  const crawled = metrics?.crawled_at ? formatUtc(metrics.crawled_at) : null;
  const summary = [crawled ? `crawled ${crawled.slice(0, 10)}` : null, `${liveOnly ? liveCount : Math.max(liveCount, snapshotCount)} ratings`]
    .filter(Boolean)
    .join(' · ');

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={cn('mt-4', className)}>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
        {hint}
        <CollapsibleTrigger className="group ml-auto inline-flex items-center gap-2 rounded-sm py-1 text-left hover:[&_span]:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <ChevronDown
            className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
            aria-hidden="true"
          />
          <span className="eyebrow text-[11px] transition-colors">Data provenance</span>
          <span className="font-mono text-[11px] text-muted-foreground transition-colors tabular-nums">{summary}</span>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <dl className="mt-3 grid gap-3 rounded-md border bg-card p-5">
          <Row label="Usage">
            {metrics?.crawled_at ? (
              <>
                {metrics.metric ?? 'distinct authors'} on <span className="font-mono">{metrics.relay ?? 'the relay'}</span>,{' '}
                {formatDay(metrics.since)} to {formatDay(metrics.until)}, crawled {formatUtc(metrics.crawled_at)}.
              </>
            ) : (
              'Usage data is not available for this build.'
            )}
          </Row>

          <Row label="Ratings">
            {liveOnly ? (
              <>
                Live relay read only{isLive ? ' (still reading…)' : ` (${liveCount} returned)`}. The crawl snapshot of{' '}
                {snapshotCount} is switched off in the relay panel.
              </>
            ) : (
              <>
                Crawl snapshot of {snapshotCount}
                {snapshotDate ? ` (${formatUtc(snapshotDate)})` : ''} merged with a live relay read
                {isLive ? ' (still reading…)' : ` (${liveCount} returned)`}. Newest revision per rater, app and NIP wins.
              </>
            )}
          </Row>

          <Row label="Raw files">
            <a href="/data/ratings.json" className={cn('font-mono', linkClass)}>
              ratings.json
            </a>{' '}
            ·{' '}
            <a href="/data/metrics.json" className={cn('font-mono', linkClass)}>
              metrics.json
            </a>{' '}
            ·{' '}
            <a href="/data/claimed.json" className={cn('font-mono', linkClass)}>
              claimed.json
            </a>{' '}
            ·{' '}
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
              registry and ratings on GitHub
            </a>
          </Row>
        </dl>
      </CollapsibleContent>
    </Collapsible>
  );
}
