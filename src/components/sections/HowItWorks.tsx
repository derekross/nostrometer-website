import { Link } from 'react-router-dom';

const STEPS = [
  {
    n: '01',
    title: 'Discover',
    body: 'Crawl kind 31990 handler events from public relays. Verify every signature. Merge duplicates; the developer’s own key wins over a same-named listing from anyone else.',
  },
  {
    n: '02',
    title: 'Rank',
    body: 'Count distinct authors who tagged their events with the app’s client tag over the last 30 days, via NIP-45 COUNT. A failed query is a ?, never a zero.',
  },
  {
    n: '03',
    title: 'Rate',
    body: 'Anyone publishes a kind 31986 rating per app per NIP. The median per cell sets the tier; the median of those sets the overall tier.',
  },
  {
    n: '04',
    title: 'Publish',
    body: 'Everything here is read straight from relays or from crawl files you can download. The tooling that produced them is open source.',
  },
];

export function HowItWorks() {
  return (
    <div>
      <p className="eyebrow mb-4">How it works</p>
      <h2 className="t-h2 max-w-[22ch]">
        Three read-only crawls, <mark className="hl">one rule</mark>, and a median.
      </h2>
      <ol className="mt-10 grid gap-x-8 gap-y-8 md:grid-cols-2">
        {STEPS.map((s) => (
          <li key={s.n} className="grid grid-cols-[3rem_1fr] gap-4">
            <span className="font-mono text-2xl font-semibold text-muted-foreground tabular-nums">{s.n}</span>
            <div>
              <h3 className="text-xl font-bold leading-7">{s.title}</h3>
              <p className="mt-2 text-base leading-6 text-muted-foreground">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-8 text-base">
        <Link to="/methodology" className="font-semibold text-primary underline underline-offset-4">
          Read the full methodology
        </Link>
      </p>
    </div>
  );
}
