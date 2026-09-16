const CARDS = [
  {
    title: 'Fewer one-client surprises for users',
    body: 'A zap that works in one app and vanishes in another is a spec problem, not a user problem. The matrix shows where that happens.',
  },
  {
    title: 'A concrete fix list for developers',
    body: 'Every cell below Flawless names a NIP and carries a note from the rater. Sorted by usage, it is a backlog with impact built in.',
  },
  {
    title: 'Gentle pressure toward interoperability',
    body: 'Nobody is graded in private. Ratings are public events, medians are reproducible, and the tooling is open. The number moves when the app does.',
  },
];

export function Mission() {
  return (
    <div>
      <p className="eyebrow mb-4">Why measure</p>
      <h2 className="t-h2 max-w-[22ch]">
        Interoperability is the <mark className="hl">whole point</mark> of a protocol.
      </h2>
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
