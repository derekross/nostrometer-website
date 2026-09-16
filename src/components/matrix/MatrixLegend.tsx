import { TIER_ORDER, TIERS } from '@/lib/appReviews';
import { TIER_LETTER } from '@/lib/tiers';
import { cn } from '@/lib/utils';

function Chip({ children, ...attrs }: React.ComponentProps<'span'>) {
  return (
    <span
      {...attrs}
      className={cn('tier-chip inline-flex h-6 w-8 items-center justify-center rounded-[4px] text-sm leading-none', attrs.className)}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

/** Always-visible key for the matrix chips. */
export function MatrixLegend({ className }: { className?: string }) {
  return (
    <dl className={cn('flex flex-wrap items-center gap-x-5 gap-y-2 text-sm', className)} aria-label="Legend">
      {TIER_ORDER.map((tier) => (
        <div key={tier} className="flex items-center gap-2">
          <dt>
            <Chip data-tier={tier}>{TIER_LETTER[tier]}</Chip>
          </dt>
          <dd>
            {TIERS[tier].label}
            <span className="ml-1 font-mono text-xs text-muted-foreground">{TIERS[tier].ratingValue.toFixed(1)}</span>
          </dd>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <dt>
          <Chip data-tier="flawless" data-self="true">
            F*
          </Chip>
        </dt>
        <dd>self-rated only</dd>
      </div>
      <div className="flex items-center gap-2">
        <dt>
          <Chip data-state="claimed">c</Chip>
        </dt>
        <dd>claimed in code, unverified</dd>
      </div>
      <div className="flex items-center gap-2">
        <dt>
          <Chip data-state="unknown">·</Chip>
        </dt>
        <dd>no data</dd>
      </div>
      <div className="flex items-center gap-2">
        <dt>
          <Chip data-tier="incomplete">
            I<sup className="absolute top-0.5 right-1 text-[9px]">2</sup>
          </Chip>
        </dt>
        <dd>superscript = distinct raters</dd>
      </div>
    </dl>
  );
}
