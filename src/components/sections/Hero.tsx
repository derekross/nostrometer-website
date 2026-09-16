import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Gauge } from '@/components/Gauge';
import { TIERS, TRACKED_NIPS } from '@/lib/appReviews';
import type { EcosystemReading } from '@/lib/matrix';
import { TAGLINE } from '@/lib/site';

interface HeroProps {
  reading: EcosystemReading | null | undefined;
  apps: number | undefined;
  ratings: number | undefined;
  loading: boolean;
}

function Counter({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-mono text-2xl font-semibold leading-7 tabular-nums">{value}</div>
      <div className="eyebrow text-[11px]">{label}</div>
    </div>
  );
}

export function Hero({ reading, apps, ratings, loading }: HeroProps) {
  const dash = loading ? '…' : '—';
  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 md:pt-24 md:pb-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:items-center">
        <div>
          <p className="eyebrow mb-4">Nostr interoperability, measured</p>
          <h1 className="t-h1 max-w-[18ch]">
            Every Nostr app, <mark className="hl">measured</mark> against the spec.
          </h1>
          <p className="mt-6 max-w-[65ch] text-xl leading-8 text-muted-foreground">{TAGLINE}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/results">
                See the results <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/methodology">How we rate</Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center rounded-md border bg-card p-6 pb-4">
          <p className="eyebrow self-start">Ecosystem reading</p>
          <Gauge
            value={reading?.value ?? 0}
            label={reading ? TIERS[reading.tier].label : loading ? 'Reading…' : 'No data'}
            sub={reading ? `Mean of ${reading.cells} rated cells · ${reading.apps} apps` : undefined}
            size={320}
            className="my-2 max-w-full"
          />
          <div className="mt-2 grid w-full grid-cols-3 gap-3 border-t pt-4">
            <Counter value={apps ? apps.toLocaleString('en-US') : dash} label="Apps" />
            <Counter value={ratings === undefined ? dash : ratings.toLocaleString('en-US')} label="Ratings" />
            <Counter value={String(TRACKED_NIPS.length)} label="NIPs" />
          </div>
        </div>
      </div>
    </section>
  );
}
