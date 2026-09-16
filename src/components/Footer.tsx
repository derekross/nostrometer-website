import { Link } from 'react-router-dom';
import { GitHubIcon } from '@/components/GitHubIcon';
import { MeterMark } from '@/components/MeterMark';
import { NAV_LINKS } from '@/lib/nav';
import { TickRuler } from '@/components/TickRuler';
import { DEREK_NPUB, REPO_URL, SITE_REPO_URL } from '@/lib/site';

const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <span className="inline-flex items-center gap-2.5">
              <MeterMark size={24} />
              <span className="font-display text-lg font-bold tracking-tight" style={{ fontStretch: '110%' }}>
                Nostrometer
              </span>
            </span>
            <p className="mt-3 text-base leading-6 text-muted-foreground">
              Nostr interoperability, measured. Every app discovered, ranked by real usage, rated NIP-by-NIP.
            </p>
          </div>

          <nav aria-label="Footer">
            <p className="eyebrow mb-3">Pages</p>
            <ul className="space-y-1.5 text-base">
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-foreground hover:text-primary hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="eyebrow mb-3">Open source · Read-only crawls · Signature-verified</p>
            <ul className="space-y-1.5 text-base">
              <li>
                <a href={REPO_URL} {...ext} className="inline-flex items-center gap-2 text-foreground hover:text-primary hover:underline">
                  <GitHubIcon /> Tooling on GitHub
                </a>
              </li>
              <li>
                <a href={`https://njump.me/${DEREK_NPUB}`} {...ext} className="text-foreground hover:text-primary hover:underline">
                  Derek Ross on Nostr
                </a>
              </li>
            </ul>
          </div>
        </div>

        <TickRuler />

        <div className="flex flex-col gap-2 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getUTCFullYear()} Nostrometer</p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <Link to="/privacy" className="hover:text-foreground hover:underline">
              Privacy
            </Link>
            <a href={SITE_REPO_URL} {...ext} className="hover:text-foreground hover:underline">
              Site source
            </a>
            <a href="/data/ratings.json" className="font-mono hover:text-foreground hover:underline">
              ratings.json
            </a>
            <a href="/data/metrics.json" className="font-mono hover:text-foreground hover:underline">
              metrics.json
            </a>
            <a href="/data/claimed.json" className="font-mono hover:text-foreground hover:underline">
              claimed.json
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
