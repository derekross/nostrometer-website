import { cn } from '@/lib/utils';

interface MeterMarkProps {
  className?: string;
  size?: number;
}

/**
 * The Nostrometer mark: a 270° gauge arc with five ticks, a violet needle at
 * the 75% position and a centre pivot. Draws in `currentColor`, needle in the
 * primary token, so it follows the theme.
 */
export function MeterMark({ className, size = 28 }: MeterMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
    >
      <path
        d="M 7.515 24.485 A 12 12 0 1 1 24.485 24.485"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="10.343" y1="21.657" x2="8.575" y2="23.425" />
        <line x1="8.609" y1="12.939" x2="6.299" y2="11.982" />
        <line x1="16" y1="8" x2="16" y2="5.5" />
        <line x1="23.391" y1="12.939" x2="25.701" y2="11.982" />
        <line x1="21.657" y1="21.657" x2="23.425" y2="23.425" />
      </g>
      <line
        x1="16"
        y1="16"
        x2="24.315"
        y2="12.556"
        stroke="var(--primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="2.5" fill="currentColor" />
    </svg>
  );
}

/** Mark + wordmark, used in the header and footer. */
export function Wordmark({ className, markSize = 28 }: { className?: string; markSize?: number }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <MeterMark size={markSize} />
      <span className="font-display text-xl font-bold tracking-tight" style={{ fontStretch: '110%' }}>
        Nostrometer
      </span>
    </span>
  );
}
