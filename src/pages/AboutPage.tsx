import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { PageHeader, Section } from '@/components/Layout';
import { MeterMark } from '@/components/MeterMark';
import { TickRuler } from '@/components/TickRuler';
import { DEFAULT_OG_IMAGE, DEREK_NPUB, NOSTRHUB_APPS_URL, REPO_URL, SITE_REPO_URL } from '@/lib/site';

const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;

export default function AboutPage() {
  const description = 'Nostrometer is a meter, not a leaderboard. Built and maintained by Derek Ross; read-only, signature-verified crawls; open source.';
  useSeoMeta({
    title: 'About · Nostrometer',
    description,
    ogTitle: 'A meter, not a leaderboard',
    ogDescription: description,
    ogImage: DEFAULT_OG_IMAGE,
    twitterCard: 'summary_large_image',
  });

  return (
    <>
      <PageHeader
        eyebrow="Readout · 07 · About"
        title={
          <>
            A <mark className="hl">meter</mark>, not a leaderboard.
          </>
        }
        lede="An instrument measures. It reports. It does not decide."
      />

      <Section className="pt-0 md:pt-0">
        <div className="grid gap-12 md:grid-cols-[1fr_16rem]">
          <div className="max-w-[65ch] space-y-5 text-lg leading-7">
            <p>
              Nostr's promise is that one identity, one set of posts and one social graph work in any app. That is only true
              if apps implement the same specs the same way, and until now nobody measured whether they do. Nostrometer is
              that measurement: every app that announces itself, ranked by real usage, rated NIP-by-NIP with ratings that
              anyone can publish and anyone can check.
            </p>
            <p>
              The numbers hold up because nothing in them is private. Every rating is a signed public event. Every tier is a
              median. Every claim from source code says which file the marker was found in. Every Borked or Isolated finding
              goes to the app's tracker as an issue. Rerun the crawls against the same relays and you get the same matrix.
            </p>
            <p>
              It is built and maintained by{' '}
              <a href={`https://njump.me/${DEREK_NPUB}`} {...ext} className="text-primary underline underline-offset-2">
                Derek Ross
              </a>
              . The crawls are read-only and every event is signature-verified before it counts. The tooling never signs or
              publishes anything; ratings are published by people, from{' '}
              <a href={NOSTRHUB_APPS_URL} {...ext} className="text-primary underline underline-offset-2">
                NostrHub
              </a>{' '}
              or any Nostr client.
            </p>
            <p>
              The data is shared 1:1 with NostrHub. The same kind 31986 events feed both. There is no private score.
            </p>
            <p>
              The name is the idea. A meter reads what is there. If a cell says Incomplete, the fix is in the app, and the
              rating changes when the app does. See the{' '}
              <Link to="/methodology" className="text-primary underline underline-offset-2">
                methodology
              </Link>{' '}
              for exactly how a number gets on the board.
            </p>
          </div>

          <aside className="space-y-6">
            <div className="rounded-md border bg-card p-6">
              <MeterMark size={40} className="text-muted-foreground" />
              <h2 className="eyebrow mt-4">Contact</h2>
              <ul className="mt-2 space-y-2 text-base">
                <li>
                  <a href={`https://njump.me/${DEREK_NPUB}`} {...ext} className="text-primary underline underline-offset-2">
                    Derek on Nostr
                  </a>
                </li>
                <li>
                  <a href={`${REPO_URL}/issues`} {...ext} className="text-primary underline underline-offset-2">
                    Issues on GitHub
                  </a>
                </li>
              </ul>
              <p className="mt-4 font-mono text-xs break-all text-muted-foreground">{DEREK_NPUB}</p>
            </div>
            <div className="rounded-md border bg-card p-6">
              <h2 className="eyebrow">Source</h2>
              <ul className="mt-2 space-y-2 text-base">
                <li>
                  <a href={REPO_URL} {...ext} className="text-primary underline underline-offset-2">
                    Tooling
                  </a>
                </li>
                <li>
                  <a href={SITE_REPO_URL} {...ext} className="text-primary underline underline-offset-2">
                    This site
                  </a>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        <TickRuler className="mt-16" />
      </Section>
    </>
  );
}
