import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TRACKED_NIPS } from '@/lib/appReviews';
import { nipShort } from '@/lib/nips';

const BY_ID = new Map(TRACKED_NIPS.map((n) => [n.id, n]));

/** Column header: the NIP number in mono, with name and description on hover. */
export function NipHeader({ id }: { id: string }) {
  const nip = BY_ID.get(id);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <abbr
          title={undefined}
          className="cursor-help font-mono text-xs font-semibold tabular-nums no-underline decoration-dotted underline-offset-4 hover:underline"
          aria-label={nip ? `NIP-${nipShort(id)}: ${nip.name}` : id}
        >
          {nipShort(id)}
        </abbr>
      </TooltipTrigger>
      <TooltipContent className="max-w-56">
        <span className="font-mono">{id.toUpperCase()}</span>
        {nip && (
          <>
            {' · '}
            {nip.name}
            <br />
            <span className="opacity-80">{nip.description}</span>
          </>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
