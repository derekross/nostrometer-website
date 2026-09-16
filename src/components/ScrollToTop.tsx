import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scroll to the top on every route change, or to the `#hash` target when
 * there is one. Lazy-loaded pages may not have rendered the target yet, so
 * retry briefly before giving up.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    let attempts = 0;
    let frame = 0;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ block: 'start' });
        return;
      }
      if (attempts++ < 60) frame = requestAnimationFrame(tryScroll);
    };
    tryScroll();
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
}
