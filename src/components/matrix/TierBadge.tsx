import { TIERS, type CompatTier } from '@/lib/appReviews';
import { TIER_LETTER, formatScore } from '@/lib/tiers';
import { cn } from '@/lib/utils';

interface TierBadgeProps {
  tier: CompatTier;
  /** Show the tier's numeric value next to the label. */
  value?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/** Labelled tier pill: letter + name, colour by tier, never colour alone. */
export function TierBadge({ tier, value, size = 'md', className }: TierBadgeProps) {
  const info = TIERS[tier];
  return (
    <span
      data-tier={tier}
      className={cn(
        'tier-chip inline-flex items-center gap-1.5 rounded-md whitespace-nowrap',
        size === 'sm' ? 'h-6 px-1.5 text-xs' : 'h-8 px-2.5 text-sm',
        className,
      )}
    >
      <span aria-hidden="true">{TIER_LETTER[tier]}</span>
      <span className="font-sans font-semibold">{info.label}</span>
      {value && <span className="opacity-80">{formatScore(info.ratingValue)}</span>}
    </span>
  );
}
