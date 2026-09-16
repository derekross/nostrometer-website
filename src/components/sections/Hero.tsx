import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Gauge } from '@/components/Gauge';
import { useIsMobile } from '@/hooks/useIsMobile';
import { TIERS, TRACKED_NIPS } from '@/lib/appReviews';
import type { EcosystemReading } from '@/lib/matrix';

interface HeroProps {
  reading: EcosystemReading | null | undefined;
  apps: number | undefined;
  ratings: number | undefined;
  loading: boolean;
}

function Led({ value, label }: { value: string; label: string }) {
  return (
    <div className="led px-3 py-3 sm:px-5 sm:py-4">
      <div className="eyebrow text-[11px]">{label}</div>
      <div className="led-value mt-1 text-[28px] leading-9 sm:text-[36px] sm:leading-10">{value}</div>
    </div>
  );
}

export function Hero({ reading, apps, ratings, loading }: HeroProps) {
  const dash = loading ? '…' : '—';
  const isMobile = useIsMobile();
  return (
    <section className="mx-auto max-w-6xl px-4 pt-12 pb-12 sm:px-6 md:pt-16 md:pb-16">
      <div className="grid gap-10 lg:grid-cols-[520px_1fr] lg:items-center lg:gap-12">
        <div className="order-2 flex flex-col items-center lg:order-1">
          <Gauge
            value={reading?.value ?? 0}
            label={reading ? TIERS[reading.tier].label : loading ? 'Reading…' : 'No data'}
            caption={reading ? `mean of ${reading.cells} rated cells` : undefined}
            size={isMobile ? 320 : 520}
            className="max-w-full"
          />
          <div className="-mt-2 grid w-full grid-cols-3 gap-2 sm:gap-3">
            <Led value={apps ? apps.toLocaleString('en-US') : dash} label="Apps discovered" />
            <Led value={ratings === undefined ? dash : ratings.toLocaleString('en-US')} label="Ratings" />
            <Led value={String(TRACKED_NIPS.length)} label="NIPs tracked" />
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <p className="eyebrow-readout mb-5">Instrument · 01 · Nostr interoperability</p>
          <h1 className="t-h1 max-w-[12ch] md:text-[72px] md:leading-[74px]">
            Every Nostr app, <mark className="hl">measured</mark> against the spec.
          </h1>
          <p className="mt-6 max-w-[46ch] text-xl leading-8 text-muted-foreground">
            Every app discovered from public relays, ranked by real usage, rated NIP-by-NIP with signed ratings anyone can
            publish and anyone can recompute.
          </p>
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
          <p className="eyebrow mt-10 flex flex-wrap gap-x-6 gap-y-1 text-[12px]">
            <span>Read-only crawls</span>
            <span>Signature-verified</span>
            <span>Median of medians</span>
          </p>
        </div>
      </div>
    </section>
  );
}
