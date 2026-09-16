import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UpdateCard } from '@/components/UpdateCard';
import { useUpdates } from '@/hooks/useUpdates';

export function LatestUpdates() {
  const updates = useUpdates();
  const latest = updates.data?.slice(0, 3) ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow-readout mb-4">Readout · 06 · Updates</p>
          <h2 className="t-h2 max-w-[22ch]">What changed.</h2>
        </div>
        <Button asChild variant="outline">
          <Link to="/updates">
            All updates <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {updates.isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-md border bg-card p-6" aria-hidden="true">
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              <div className="mt-4 h-6 w-4/5 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-4 w-full animate-pulse rounded bg-muted" />
            </div>
          ))}
        {latest.map((e) => (
          <UpdateCard key={e.id} event={e} />
        ))}
        {!updates.isLoading && latest.length === 0 && (
          <div className="rounded-md border border-dashed bg-card px-8 py-12 text-center text-muted-foreground md:col-span-3">
            No updates published yet. Follow Derek on Nostr for the first one.
          </div>
        )}
      </div>
    </div>
  );
}
