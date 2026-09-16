import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { PageHeader, Section } from '@/components/Layout';
import { TickRuler } from '@/components/TickRuler';
import { DEFAULT_OG_IMAGE, DEREK_NPUB, REPO_URL, SITE_REPO_URL } from '@/lib/site';

const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;

export default function PrivacyPage() {
  const description =
    'Nostrometer sets no cookies, runs no analytics and has no accounts. What your browser stores, and who sees your address.';
  useSeoMeta({
    title: 'Privacy · Nostrometer',
    description,
    ogTitle: 'What this site knows about you',
    ogDescription: description,
    ogImage: DEFAULT_OG_IMAGE,
    twitterCard: 'summary_large_image',
  });

  return (
    <>
      <PageHeader
        eyebrow="Readout · 08 · Privacy"
        title={
          <>
            What this site <mark className="hl">knows</mark> about you.
          </>
        }
        lede="Nothing, on our side. The longer version is below, because a site about verifiable claims should be checkable on this too."
      />

      <Section className="pt-0 md:pt-0">
        <div className="max-w-[65ch] space-y-10 text-lg leading-7">
          <div>
            <h2 className="t-h3">No accounts, no cookies, no analytics</h2>
            <p className="mt-4">
              There is no sign-up, no login and no comment box, so there is nothing to collect. The site sets no cookies.
              It runs no analytics, no tag manager and no third-party scripts of any kind. Nobody here is counting your
              visit or building a profile of you.
            </p>
            <p className="mt-4">
              Nostrometer is read-only. It never asks for a key, never signs anything, and never publishes on your
              behalf. Rating happens on other sites, with your own client.
            </p>
          </div>

          <TickRuler />

          <div>
            <h2 className="t-h3">What your browser stores</h2>
            <p className="mt-4">
              Two preferences live in your browser's local storage: your theme, and the relays you chose in the relay
              panel. They stay on your device, are readable only by this site, and are never transmitted anywhere. Clear
              your site data and they are gone.
            </p>
          </div>

          <TickRuler />

          <div>
            <h2 className="t-h3">Who does see your address</h2>
            <p className="mt-4">
              The page has to fetch data to be useful, and the servers it fetches from can see your IP address, as they
              would with any Nostr client:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>
                <strong>The relays you read from.</strong> They see a connection and the queries the page makes. You
                choose which ones in the relay panel in the header, and you can point the site at your own.
              </li>
              <li>
                <strong>Servers hosting app icons and profile pictures.</strong> Those images are loaded from wherever
                each developer put them. Requests for them carry no referrer.
              </li>
              <li>
                <strong>This site's own host.</strong> It serves the pages and the crawl files. Its logs anonymise
                client addresses.
              </li>
            </ul>
            <p className="mt-4">
              Everything the site reads is already public: the ratings, listings and articles are signed Nostr events
              that anyone can fetch.
            </p>
          </div>

          <TickRuler />

          <div>
            <h2 className="t-h3">Checking any of this</h2>
            <p className="mt-4">
              Open your browser's network tab and watch what the page requests. Or read the source: the{' '}
              <a href={SITE_REPO_URL} {...ext} className="text-primary underline underline-offset-2">
                site
              </a>{' '}
              and the{' '}
              <a href={REPO_URL} {...ext} className="text-primary underline underline-offset-2">
                tooling
              </a>{' '}
              are both open. The{' '}
              <Link to="/methodology" className="text-primary underline underline-offset-2">
                methodology
              </Link>{' '}
              covers what the crawlers do, which is likewise read-only.
            </p>
            <p className="mt-4">
              Questions go to{' '}
              <a href={`https://njump.me/${DEREK_NPUB}`} {...ext} className="text-primary underline underline-offset-2">
                Derek on Nostr
              </a>
              .
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
