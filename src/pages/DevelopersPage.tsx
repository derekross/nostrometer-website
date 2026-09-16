import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { PageHeader, Section } from '@/components/Layout';
import { TickRuler } from '@/components/TickRuler';
import { DEFAULT_OG_IMAGE, DEREK_NPUB, NOSTRHUB_APPS_URL, REPO_URL } from '@/lib/site';

const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;

const LISTING_EXAMPLE = `{
  "kind": 31990,
  "content": "{\\"name\\":\\"Your App\\",\\"picture\\":\\"https://…/icon.png\\",\\"about\\":\\"One sentence.\\",\\"website\\":\\"https://yourapp.example\\"}",
  "tags": [
    ["d", "your-app"],
    ["k", "1"], ["k", "30023"],
    ["web", "https://yourapp.example/<bech32>", "nevent"],
    ["android", "yourapp://<bech32>"],
    ["i", "nip-01", "nip"], ["i", "nip-17", "nip"], ["i", "nip-57", "nip"]
  ]
}`;

const NAK_ONE_LINER = `nak event --sec <nsec|ncryptsec|bunker://…> < listing.json \\
  wss://relay.ditto.pub wss://nos.lol wss://nostr.mom`;

function Step({ n, title, children }: { n: string; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 md:grid-cols-[4rem_1fr]">
      <span className="font-mono text-2xl font-semibold text-muted-foreground tabular-nums">{n}</span>
      <div className="max-w-[65ch]">
        <h2 className="t-h3">{title}</h2>
        <div className="mt-4 space-y-4 text-lg leading-7">{children}</div>
      </div>
    </div>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-md border bg-muted p-4 text-sm leading-6">
      <code>{children}</code>
    </pre>
  );
}

export default function DevelopersPage() {
  const description = 'Publish a listing, tag your events, rate your own app, and dispute a cell. How developers take part in Nostrometer.';
  useSeoMeta({
    title: 'For developers · Nostrometer',
    description,
    ogTitle: 'Your fix list, sorted by impact',
    ogDescription: description,
    ogImage: DEFAULT_OG_IMAGE,
    twitterCard: 'summary_large_image',
  });

  return (
    <>
      <PageHeader
        eyebrow="For developers"
        title={
          <>
            Your fix list, <mark className="hl">sorted by impact</mark>.
          </>
        }
        lede="Every cell below Flawless names a NIP and carries a note. Here is how to get on the board, get counted, and move a score."
      />

      <Section className="space-y-16 pt-0 md:pt-0">
        <Step n="01" title="Publish a kind 31990 listing">
          <p>
            The matrix keys everything on your NIP-89 handler event. Without one, there is nothing to rate. A complete listing
            carries:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              a stable <code className="rounded bg-muted px-1.5 py-0.5 text-[0.9em]">d</code> tag (change it and you start over)
            </li>
            <li>
              <code className="rounded bg-muted px-1.5 py-0.5 text-[0.9em]">name</code>,{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 text-[0.9em]">picture</code>,{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 text-[0.9em]">about</code> and{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 text-[0.9em]">website</code> in the content JSON
            </li>
            <li>
              <code className="rounded bg-muted px-1.5 py-0.5 text-[0.9em]">k</code> tags for the kinds you handle
            </li>
            <li>
              platform tags (<code className="rounded bg-muted px-1.5 py-0.5 text-[0.9em]">web</code>,{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 text-[0.9em]">android</code>,{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 text-[0.9em]">ios</code>, …) with URL templates
            </li>
            <li>
              <code className="rounded bg-muted px-1.5 py-0.5 text-[0.9em]">i</code> tags naming the NIPs you implement
            </li>
          </ul>
          <Code>{LISTING_EXAMPLE}</Code>
          <p>
            The{' '}
            <a href={`${NOSTRHUB_APPS_URL}/submit`} {...ext} className="text-primary underline underline-offset-2">
              nostrhub.io/apps wizard
            </a>{' '}
            builds and signs one for you. If you prefer a file and a key, this one-liner with{' '}
            <a href="https://github.com/fiatjaf/nak" {...ext} className="text-primary underline underline-offset-2">
              nak
            </a>{' '}
            does it:
          </p>
          <Code>{NAK_ONE_LINER}</Code>
          <p>
            <strong>Publish it from the key you develop with.</strong> Ratings bind to the listing's address. If someone else
            seeds a listing for your app, every rating attaches to their copy, and when you finally publish your own the
            ratings do not follow. Only the key that published a listing can update it, so the implemented NIPs, platforms
            and repo link are yours to set. One listing from your key, and everything published about your app sticks to it
            for good.
          </p>
        </Step>

        <TickRuler />

        <Step n="02" title={<>Tag events with <code className="font-mono">client</code> so usage counts you</>}>
          <p>
            Monthly authors are counted by the <code className="rounded bg-muted px-1.5 py-0.5 text-[0.9em]">client</code> tag on
            published events. Add one to everything your app signs:
          </p>
          <Code>{`["client", "Your App", "31990:<your-pubkey>:your-app", "wss://relay.ditto.pub"]`}</Code>
          <p>
            The first value is matched against your listing's name and website host. An app that does not tag shows as 0,
            and 0 sorts last. A listing seeded under someone else's key, or a name whose capitalisation differs from what
            your app writes in the tag, makes the count miss you. Your own listing fixes both.
          </p>
        </Step>

        <TickRuler />

        <Step n="03" title="Rate your own app">
          <p>
            Publish kind 31986 ratings for the NIPs you implement, from the same key as your listing. They appear immediately,
            marked <span className="font-mono">*</span> self-rated until an independent rater confirms them. That is not a
            penalty; it is provenance.
          </p>
          <p>
            Rate against what the NIP requires of a client, and leave unimplemented NIPs unrated. The full rule is on the{' '}
            <Link to="/methodology" className="text-primary underline underline-offset-2">
              methodology page
            </Link>
            .
          </p>
        </Step>

        <TickRuler />

        <Step n="04" title="Disagree with a cell? Publish a rating.">
          <p>
            There is no appeals form. Every cell is a median of public events, so the way to change it is to add one. Fix the
            issue, publish your rating with a note pointing at the commit, and ask a rater to re-check. The median moves.
          </p>
          <p>
            You will not be surprised by a bad cell. Every Borked or Isolated finding comes with an issue in your tracker
            that names the NIP, the clause, and what we saw, before it is public anywhere else.
          </p>
        </Step>

        <TickRuler />

        <Step n="05" title="Request a review">
          <p>
            Reviews are worked in waves, ordered by usage. To get in the queue, open an issue on{' '}
            <a href={`${REPO_URL}/issues`} {...ext} className="text-primary underline underline-offset-2">
              the tooling repo
            </a>{' '}
            with your listing's naddr, or message{' '}
            <a href={`https://njump.me/${DEREK_NPUB}`} {...ext} className="text-primary underline underline-offset-2">
              Derek on Nostr
            </a>
            .
          </p>
        </Step>
      </Section>
    </>
  );
}
