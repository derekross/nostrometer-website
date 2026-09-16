import { useSeoMeta } from '@unhead/react';
import { Section } from '@/components/Layout';
import { TickRuler } from '@/components/TickRuler';
import { Hero } from '@/components/sections/Hero';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { LatestUpdates } from '@/components/sections/LatestUpdates';
import { MatrixPreview } from '@/components/sections/MatrixPreview';
import { Mission } from '@/components/sections/Mission';
import { StatTiles } from '@/components/sections/StatTiles';
import { useMatrix } from '@/hooks/useMatrix';
import { DEFAULT_OG_IMAGE, TAGLINE } from '@/lib/site';

const Index = () => {
  useSeoMeta({
    title: 'Nostrometer: Nostr interoperability, measured',
    description: TAGLINE,
    ogTitle: 'Nostrometer: Nostr interoperability, measured',
    ogDescription: TAGLINE,
    ogImage: DEFAULT_OG_IMAGE,
    twitterCard: 'summary_large_image',
  });

  const matrix = useMatrix();

  return (
    <>
      <Hero />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <StatTiles
          metrics={matrix.metrics}
          ratings={matrix.reviews?.length}
          ratedApps={matrix.rows?.length}
          loading={matrix.isLoading}
        />
      </div>
      <Section>
        <MatrixPreview rows={matrix.rows} isLoading={matrix.isLoading} isError={matrix.isError} />
      </Section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6"><TickRuler /></div>
      <Section>
        <Mission />
      </Section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6"><TickRuler /></div>
      <Section>
        <HowItWorks />
      </Section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6"><TickRuler /></div>
      <Section>
        <LatestUpdates />
      </Section>
    </>
  );
};

export default Index;
