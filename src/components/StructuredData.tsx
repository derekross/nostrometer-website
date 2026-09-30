import { useHead } from '@unhead/react';
import { TRACKED_NIPS } from '@/lib/appReviews';
import { absoluteUrl } from '@/lib/seo';
import { DEREK_NPUB, REPO_URL, SITE_NAME, SITE_URL, TAGLINE } from '@/lib/site';
import { formatDay, type MetricsData } from '@/lib/staticData';

/**
 * schema.org markup, emitted as JSON-LD.
 *
 * Deliberately excluded: anything that presents a tier as a star rating. The
 * scale here measures compliance with a specification (0 to 100 on the page,
 * 0 to 1 in the events), and dressing it up as `aggregateRating` would both misrepresent it and invite a search
 * policy problem.
 *
 * JSON-LD is a data block rather than executable script, so it is not affected
 * by the page's `script-src 'self'` policy.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = Record<string, any>;

function useJsonLd(id: string, data: Json | null) {
  useHead({
    script: data
      ? [{ key: id, id, type: 'application/ld+json', innerHTML: JSON.stringify(data) }]
      : [],
  });
}

const PERSON = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#derek`,
  name: 'Derek Ross',
  url: `https://njump.me/${DEREK_NPUB}`,
} as const;

/** Home: what the site is and who runs it. */
export function SiteStructuredData() {
  useJsonLd('ld-website', {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        description: TAGLINE,
        inLanguage: 'en',
        publisher: { '@id': `${SITE_URL}/#derek` },
      },
      PERSON,
    ],
  });
  return null;
}

/**
 * Results: the matrix is a published, openly licensed measurement set, which is
 * precisely what `Dataset` describes.
 */
export function ResultsStructuredData({ metrics, ratings }: { metrics: MetricsData | undefined; ratings: number | undefined }) {
  const from = formatDay(metrics?.since);
  const to = formatDay(metrics?.until);
  useJsonLd('ld-dataset', {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${SITE_URL}/results#dataset`,
    name: 'Nostr app interoperability matrix',
    description: `NIP-by-NIP interoperability ratings for Nostr applications across ${TRACKED_NIPS.length} tracked NIPs, with usage measured as distinct monthly authors${ratings ? ` and ${ratings} community ratings` : ''}.`,
    url: `${SITE_URL}/results`,
    license: 'https://opensource.org/licenses/MIT',
    isAccessibleForFree: true,
    creator: { '@id': `${SITE_URL}/#derek` },
    isPartOf: { '@id': `${SITE_URL}/#website` },
    keywords: ['Nostr', 'interoperability', 'NIP', 'protocol compliance', 'decentralised social'],
    ...(from && to ? { temporalCoverage: `${from}/${to}` } : {}),
    ...(metrics?.crawled_at ? { dateModified: metrics.crawled_at.slice(0, 10) } : {}),
    distribution: [
      { name: 'Community ratings', path: '/data/ratings.json' },
      { name: 'Usage metrics', path: '/data/metrics.json' },
      { name: 'Claimed NIP support', path: '/data/claimed.json' },
    ].map((d) => ({
      '@type': 'DataDownload',
      name: d.name,
      encodingFormat: 'application/json',
      contentUrl: absoluteUrl(d.path),
    })),
    codeRepository: REPO_URL,
  });
  return null;
}

/** One update article. */
export function ArticleStructuredData({
  headline,
  description,
  published,
  path,
  image,
}: {
  headline: string;
  description?: string;
  /** Unix seconds. */
  published: number;
  path: string;
  image?: string;
}) {
  useJsonLd('ld-article', {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    ...(description ? { description } : {}),
    datePublished: new Date(published * 1000).toISOString(),
    author: PERSON,
    publisher: { '@id': `${SITE_URL}/#derek` },
    mainEntityOfPage: absoluteUrl(path),
    ...(image ? { image } : {}),
  });
  return null;
}

/** Mirrors the breadcrumb nav the app and update pages already render. */
export function BreadcrumbStructuredData({ trail }: { trail: { name: string; path: string }[] }) {
  useJsonLd('ld-breadcrumb', {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((step, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: step.name,
      item: absoluteUrl(step.path),
    })),
  });
  return null;
}
