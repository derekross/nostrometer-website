import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AppInfo } from '@/lib/apps';
import { sanitizeUrl } from '@/lib/sanitizeUrl';
import { NOSTRHUB_URL } from '@/lib/site';

interface AppHeaderProps {
  app: AppInfo | null;
  /** Fallback name when the listing has not loaded. */
  name: string;
  naddr: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function AppHeader({ app, name, naddr }: AppHeaderProps) {
  const picture = sanitizeUrl(app?.picture);

  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-start">
      <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-card font-display text-3xl font-bold">
        {picture ? (
          <img src={picture} alt="" width={96} height={96} loading="lazy" referrerPolicy="no-referrer" className="size-full object-cover" />
        ) : (
          <span aria-hidden="true">{initials(name)}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="eyebrow">App report</p>
        <h1 className="t-h1 mt-1 break-words">{name}</h1>
        {app?.about && <p className="mt-3 max-w-[60ch] text-lg leading-7 text-muted-foreground">{app.about}</p>}
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <a href={`${NOSTRHUB_URL}/${naddr}`} target="_blank" rel="noopener noreferrer">
              Rate on NostrHub <ExternalLink className="size-4" />
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={`https://njump.me/${naddr}`} target="_blank" rel="noopener noreferrer">
              View listing
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
