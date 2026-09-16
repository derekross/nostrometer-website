import { useHead } from '@unhead/react';
import { useLocation } from 'react-router-dom';
import { absoluteUrl, canonicalPath } from '@/lib/seo';

/**
 * Emits a <link rel="canonical"> and matching og:url for every route so search
 * engines consolidate trailing-slash / query-string variants onto one URL.
 * Mount once inside the router.
 */
export function CanonicalLink() {
  const { pathname } = useLocation();
  const href = absoluteUrl(canonicalPath(pathname));

  useHead({
    link: [{ key: 'canonical', rel: 'canonical', href }],
    meta: [{ key: 'og:url', property: 'og:url', content: href }],
  });

  return null;
}
