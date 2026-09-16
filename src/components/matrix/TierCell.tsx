import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TIER_LETTER } from '@/lib/tiers';
import { TIERS } from '@/lib/appReviews';
import type { MatrixCell } from '@/lib/matrix';

interface TierCellProps {
  cell: MatrixCell | undefined;
  claimed: boolean;
  nipId: string;
  appName: string;
  /** Compact chips let all 30 columns fit on a wide screen. */
  compact?: boolean;
}

const CHIP = 'tier-chip relative inline-flex items-center justify-center rounded-[4px] leading-none';
const SIZE = { normal: 'h-6 w-8 text-sm', compact: 'h-[22px] w-7 text-[13px]' };

function raterLabel(n: number): string {
  return `${n} ${n === 1 ? 'rater' : 'raters'}`;
}

/**
 * One 32×24 chip. Verified: tier letter, superscript rater count, `*` and a
 * dashed border when only the app's own publisher rated it. Claimed: hatched
 * `c`. Nothing known: a dot.
 */
export function TierCell({ cell, claimed, nipId, appName, compact }: TierCellProps) {
  const nip = nipId.toUpperCase();
  const box = `${CHIP} ${compact ? SIZE.compact : SIZE.normal}`;

  if (cell) {
    const tier = TIERS[cell.tier];
    const description = [
      tier.label,
      raterLabel(cell.raters),
      cell.selfOnly ? 'self-rated' : null,
    ]
      .filter(Boolean)
      .join(' · ');
    const label = `${appName}, ${nip}: ${description}`;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            data-tier={cell.tier}
            data-self={cell.selfOnly ? 'true' : undefined}
            className={box}
            role="img"
            aria-label={label}
            tabIndex={0}
          >
            {TIER_LETTER[cell.tier]}
            {cell.selfOnly && <span aria-hidden="true">*</span>}
            {cell.raters > 1 && (
              <sup aria-hidden="true" className="absolute top-0.5 right-1 text-[9px] font-medium leading-none">
                {cell.raters}
              </sup>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent>{description}</TooltipContent>
      </Tooltip>
    );
  }

  if (claimed) {
    const description = 'Claimed in source code, not yet verified';
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            data-state="claimed"
            className={box}
            role="img"
            aria-label={`${appName}, ${nip}: ${description}`}
            tabIndex={0}
          >
            c
          </span>
        </TooltipTrigger>
        <TooltipContent>{description}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <span
      data-state="unknown"
      className={box}
      role="img"
      aria-label={`${appName}, ${nip}: no data`}
    >
      <span aria-hidden="true" className="opacity-60">·</span>
    </span>
  );
}
