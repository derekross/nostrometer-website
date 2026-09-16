import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MeterMark } from '@/components/MeterMark';
import { TAGLINE } from '@/lib/site';

const POINTS = [
  { k: 'Discovered', v: 'Every kind 31990 listing, crawled from public relays and signature-verified.' },
  { k: 'Ranked', v: 'By distinct monthly authors on the relay, not by downloads or follower counts.' },
  { k: 'Rated', v: 'One chip per NIP. The community median wins; self-ratings are marked.' },
  { k: 'Open', v: 'Ratings are kind 31986 events anyone can publish. The tooling is on GitHub.' },
];

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 md:pt-24 md:pb-16">
      <div className="grid gap-10 lg:grid-cols-[3fr_2fr] lg:items-start">
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

        <div className="rounded-md border bg-card p-6">
          <div className="mb-5 flex items-center justify-between border-b pb-4">
            <span className="eyebrow">What the meter reads</span>
            <MeterMark size={28} className="text-muted-foreground" />
          </div>
          <ul className="space-y-5">
            {POINTS.map((p) => (
              <li key={p.k} className="grid grid-cols-[7.5rem_1fr] gap-3">
                <span className="eyebrow pt-1">{p.k}</span>
                <span className="text-base leading-6">{p.v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
