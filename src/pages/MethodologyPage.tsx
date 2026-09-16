import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { PageHeader, Section } from '@/components/Layout';
import { TickRuler } from '@/components/TickRuler';
import { TierScale } from '@/components/sections/TierScale';
import { DEFAULT_OG_IMAGE, NIPS_REPO_URL, REPO_URL } from '@/lib/site';

const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;

function Block({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid gap-6 md:grid-cols-[14rem_1fr]">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="t-h3 mt-2">{title}</h2>
      </div>
      <div className="max-w-[65ch] space-y-4 text-lg leading-7">{children}</div>
    </div>
  );
}

export default function MethodologyPage() {
  const description = 'Three read-only crawls, one rating rule, and a median. How Nostrometer discovers apps, ranks them by usage and rates them NIP-by-NIP.';
  useSeoMeta({
    title: 'Methodology · Nostrometer',
    description,
    ogTitle: 'How the meter works',
    ogDescription: description,
    ogImage: DEFAULT_OG_IMAGE,
    twitterCard: 'summary_large_image',
  });

  return (
    <>
      <PageHeader
        eyebrow="Methodology"
        title={
          <>
            How the <mark className="hl">meter</mark> works.
          </>
        }
        lede="Three read-only crawls, one rating rule, and a median. Nothing here needs trust in us."
      />

      <Section className="space-y-16 pt-0 md:pt-0">
        <Block eyebrow="01 · Discovery" title="Every listing, signature-verified">
          <p>
            Apps announce themselves with kind 31990 handler events (NIP-89). We crawl those from public relays, verify every
            signature, skip malformed events and strip control characters from names.
          </p>
          <p>
            Same-named listings are merged into one record. When one of them was published from the developer's own key,
            that listing is authoritative; a same-named listing from anyone else never overrides it.
          </p>
          <p>
            A seed list from nostrapps.com fills gaps for apps that never published a listing. Listings that look like
            generated bot fleets are flagged and excluded from the matrix.
          </p>
        </Block>

        <TickRuler />

        <Block eyebrow="02 · Usage" title="Distinct authors, not downloads">
          <p>
            Usage is a NIP-45 <code className="rounded bg-muted px-1.5 py-0.5 text-[0.9em]">COUNT</code> with{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-[0.9em]">distinct:author</code> on relay.ditto.pub,
            keyed by the app's <code className="rounded bg-muted px-1.5 py-0.5 text-[0.9em]">#client</code> tag values
            over a 30-day window. It counts people who published something from the app, once each.
          </p>
          <p>
            It is one relay's view and it undercounts apps that do not tag their events. That is the point of publishing the
            method: a developer can fix the count by tagging.
          </p>
          <p>
            A failed query is recorded as <span className="font-mono">?</span>, never as zero.
          </p>
        </Block>

        <TickRuler />

        <Block eyebrow="03 · Rating rule" title="What a NIP requires of a client">
          <blockquote className="border-l-2 border-primary pl-4 text-muted-foreground">
            <p>
              <strong className="text-foreground">How to rate.</strong> Rate an app against what the NIP <em>requires of a client</em>{' '}
              (MUST, and SHOULD where interoperability visibly suffers) plus the features the app actually exposes. Optional
              methods, kinds, or flows the app doesn't offer are not gaps: a wallet that only implements{' '}
              <code className="rounded bg-muted px-1 text-[0.9em]">pay_invoice</code> is still Flawless on NIP-47. Borked means
              the app fails or crashes on the NIP's basic events, not that the feature is absent. Leave unimplemented NIPs
              unrated. Always check the current NIP text at{' '}
              <a href={NIPS_REPO_URL} {...ext} className="text-primary underline underline-offset-2">
                nostr-protocol/nips
              </a>{' '}
              before calling something a violation; NIPs change, and a rating against a stale draft is wrong.
            </p>
          </blockquote>
          <p>
            Ratings are kind 31986 events (proposed NIP-85 reviews) labelled{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-[0.9em]">nip-compatibility</code> and addressed to the app's
            kind 31990 listing. The same events power{' '}
            <a href="https://nostrhub.io/apps" {...ext} className="text-primary underline underline-offset-2">
              nostrhub.io/apps
            </a>
            .
          </p>
        </Block>

        <TickRuler />

        <Block eyebrow="04 · Tiers and trust" title="Four tiers, a median, and a marker for self-ratings">
          <p>Each rating carries one of four values. The tier of a cell is the median of every rating in it.</p>
        </Block>
        <TierScale />
        <Block eyebrow="" title="">
          <ul className="list-disc space-y-3 pl-6">
            <li>
              <strong>Median, not mean.</strong> One outlier cannot move a cell. The overall tier of an app is the median of its
              per-NIP medians.
            </li>
            <li>
              <strong>Self-ratings are marked.</strong> When every rater in a cell is the listing's own publisher, the chip carries
              a <span className="font-mono">*</span> and a dashed border. It counts, but it is not independent verification.
            </li>
            <li>
              <strong>Rater counts are shown.</strong> A superscript on each chip and a count per app tell you how many distinct
              keys stand behind a tier.
            </li>
            <li>
              <strong>Current NIP text, always.</strong> Reviews check the live spec, not a remembered draft. When a NIP revision
              shifts a score, it is noted in <Link to="/updates" className="text-primary underline underline-offset-2">Updates</Link>.
            </li>
            <li>
              <strong>Claimed is not verified.</strong> A hatched <span className="font-mono">c</span> means markers for the NIP were
              found in the client's source. Nobody has rated it yet.
            </li>
          </ul>
          <p>
            All crawling is read-only and the crawlers never sign or publish events. The scripts live at{' '}
            <a href={REPO_URL} {...ext} className="text-primary underline underline-offset-2">
              github.com/derekross/nostrometer
            </a>
            .
          </p>
        </Block>
      </Section>
    </>
  );
}
