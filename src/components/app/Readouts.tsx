import { useAuthor } from '@/hooks/useAuthor';
import { TRACKED_NIPS, type ReviewReport } from '@/lib/appReviews';
import { formatMau } from '@/lib/staticData';
import { cn } from '@/lib/utils';

function Readout({ label, value, note, small }: { label: string; value: string; note: string; small?: boolean }) {
  return (
    <div className="led p-5">
      <p className="eyebrow text-[11px]">{label}</p>
      <p className={cn('led-value mt-2 whitespace-nowrap', small ? 'text-[32px] leading-[52px]' : 'text-[40px] leading-[52px] md:text-[44px]')}>
        {value}
      </p>
      <p className="mt-1 text-sm leading-5 text-muted-foreground">{note}</p>
    </div>
  );
}

interface ReadoutsProps {
  mau: number | null;
  reviews: ReviewReport[] | undefined;
}

/** The score-card row: authors, raters, NIPs rated, last rated. */
export function Readouts({ mau, reviews }: ReadoutsProps) {
  const raters = new Set((reviews ?? []).map((r) => r.authorPubkey)).size;
  const nips = new Set((reviews ?? []).map((r) => r.nip)).size;
  const latest = reviews?.[0];
  const author = useAuthor(latest?.authorPubkey);
  const latestName = author.data?.metadata?.name ?? author.data?.metadata?.display_name;
  const latestDate = latest ? new Date(latest.createdAt * 1000) : null;
  const dash = reviews ? '0' : '…';

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Readout label="Monthly authors" value={formatMau(mau)} note="distinct #client authors, 30 days" />
      <Readout label="Raters" value={reviews ? String(raters) : dash} note="distinct keys" />
      <Readout label="NIPs rated" value={reviews ? String(nips) : dash} note={`of ${TRACKED_NIPS.length} tracked · ${reviews?.length ?? 0} ratings`} />
      <Readout
        label="Last rated"
        value={latestDate ? latestDate.toISOString().slice(5, 10).replace('-', '/') : '—'}
        note={latestDate ? `${latestDate.getUTCFullYear()}${latestName ? `, by ${latestName}` : ''}` : 'no ratings yet'}
        small
      />
    </div>
  );
}
