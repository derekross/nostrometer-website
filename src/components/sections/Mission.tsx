const CARDS = [
  {
    title: 'Fewer one-client surprises for users',
    body: 'A zap that works in one app and vanishes in another is a protocol failure that users blame on Nostr. The matrix shows exactly where it happens, so it gets fixed instead of tolerated.',
  },
  {
    title: 'A concrete fix list for developers',
    body: 'Every cell below Flawless names a NIP, carries the rater\u2019s note, and comes with an upstream issue filed with the app. Sorted by real usage, it is a backlog with impact built in.',
  },
  {
    title: 'Pressure that is public and fair',
    body: 'Nobody is graded in private. Ratings are signed public events, medians are reproducible, the tooling is open, and the number moves when the app does.',
  },
];

export function Mission() {
  return (
    <div>
      <p className="eyebrow mb-4">Why measure</p>
      <h2 className="t-h2 max-w-[22ch]">
        Interoperability is the <mark className="hl">whole point</mark> of a protocol.
      </h2>
      <p className="mt-6 max-w-[65ch] text-xl leading-8 text-muted-foreground">
        Nostr's promise is that your identity, your posts and your relationships work in any app. That promise only holds
        when apps implement the same specs the same way. Nostrometer makes it measurable.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {CARDS.map((c) => (
          <div key={c.title} className="rounded-md border bg-card p-6">
            <h3 className="text-xl font-bold leading-7">{c.title}</h3>
            <p className="mt-3 text-base leading-6 text-muted-foreground">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
