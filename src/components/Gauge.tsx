import { useEffect, useRef, useState } from 'react';
import { TIER_ORDER } from '@/lib/appReviews';
import { TIER_LETTER } from '@/lib/tiers';
import { cn } from '@/lib/utils';

interface GaugeProps {
  /** 0..1, where the tier thresholds sit at 0.25, 0.5 and 0.75. */
  value: number;
  /** Tier name, shown after the numeral. */
  label: string;
  /** What the needle reads, e.g. "mean of 119 rated cells". */
  caption?: string;
  size?: number;
  className?: string;
  /** Sweep the needle from zero on mount and whenever the value changes. */
  animate?: boolean;
}

const START = 135;
const SWEEP = 270;
const SWEEP_MS = 1600;
const EASE = 'cubic-bezier(0.22, 0.9, 0.24, 1)';

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const t = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
}

function arc(cx: number, cy: number, r: number, v0: number, v1: number): string {
  const a0 = START + SWEEP * v0;
  const a1 = START + SWEEP * v1;
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

const BANDS = ['var(--gauge-1)', 'var(--gauge-2)', 'var(--gauge-3)', 'var(--gauge-4)'];
const SCALE = [
  { at: 0, text: '0.0' },
  { at: 0.25, text: '.25' },
  { at: 0.5, text: '.50' },
  { at: 0.75, text: '.75' },
  { at: 1, text: '1.0' },
];

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** Eases a displayed number toward `target` over the sweep duration; returns `target` when disabled. */
function useCountUp(target: number, enabled: boolean): number {
  const [shown, setShown] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    if (!enabled) return;
    const from = fromRef.current;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / SWEEP_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = from + (target - from) * eased;
      setShown(v);
      if (t < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, enabled]);
  return enabled ? shown : target;
}

/**
 * The bench dial: a 270° scale in four lightness steps of the brand violet,
 * a fine tick ring, inner scale numbers, tier letters on the rim, and a
 * glowing needle that sweeps from zero to the reading.
 */
export function Gauge({ value, label, caption, size = 320, className, animate = true }: GaugeProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const sw = size * 0.06;
  const v = Math.min(1, Math.max(0, value));

  const motion = animate && !prefersReducedMotion();
  const angle = START + SWEEP * v;
  const shown = useCountUp(v, motion);

  const needleLen = r - sw * 1.0;
  const tailLen = size * 0.05;

  return (
    <div
      className={cn('relative', className)}
      style={{ width: size, height: size, filter: 'drop-shadow(0 0 28px color-mix(in oklab, var(--primary) 30%, transparent))' }}
      role="img"
      aria-label={`${value.toFixed(2)}, ${label}${caption ? `, ${caption}` : ''}`}
    >
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
        {[
          { rr: r - sw * 2.4, op: 0.15, da: '2 6' },
          { rr: r + sw * 1.6, op: 0.12, da: '1 10' },
          { rr: r + sw * 2.2, op: 0.08, da: 'none' },
        ].map((ring) => (
          <circle key={ring.rr} cx={cx} cy={cy} r={ring.rr} fill="none" className="stroke-foreground" strokeOpacity={ring.op} strokeWidth={1} strokeDasharray={ring.da} />
        ))}
        <path d={arc(cx, cy, r, 0, 1)} fill="none" className="stroke-muted" strokeWidth={sw} />
        {BANDS.map((token, i) => (
          <path key={token} d={arc(cx, cy, r, i * 0.25, (i + 1) * 0.25)} fill="none" style={{ stroke: token }} strokeWidth={sw} />
        ))}
        {Array.from({ length: 101 }, (_, i) => {
          const major = i % 10 === 0;
          const mid = i % 5 === 0;
          const a = START + (SWEEP / 100) * i;
          const [x0, y0] = polar(cx, cy, r - sw * 0.9, a);
          const [x1, y1] = polar(cx, cy, r - sw * (major ? 1.8 : mid ? 1.4 : 1.15), a);
          return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} className="stroke-foreground" strokeOpacity={major ? 1 : mid ? 0.55 : 0.3} strokeWidth={major ? 2 : 1} />;
        })}
        {SCALE.map((s) => {
          const [x, y] = polar(cx, cy, r - sw * 2.9, START + SWEEP * s.at);
          return (
            <text key={s.at} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground font-mono" fontSize={size * 0.028}>
              {s.text}
            </text>
          );
        })}
        {TIER_ORDER.map((tier, i) => {
          const at = 0.875 - i * 0.25;
          const [x, y] = polar(cx, cy, r + sw * 1.15, START + SWEEP * at);
          return (
            <text key={tier} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="font-mono font-semibold" fontSize={size * 0.032} style={{ fill: `var(--tier-${tier})` }}>
              {TIER_LETTER[tier]}
            </text>
          );
        })}
        <g
          // Re-keying on the value restarts the sweep from zero whenever the reading changes.
          key={angle}
          style={{
            transform: `rotate(${angle}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            animation: motion ? `gauge-sweep ${SWEEP_MS}ms ${EASE} both` : undefined,
          }}
        >
          <line
            x1={cx - tailLen}
            y1={cy}
            x2={cx + needleLen}
            y2={cy}
            className="stroke-primary"
            strokeWidth={size * 0.012}
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 6px var(--primary))' }}
          />
        </g>
        <circle cx={cx} cy={cy} r={size * 0.03} className="fill-background stroke-primary" strokeWidth={3} />
      </svg>
      <div className="absolute inset-x-0 text-center" style={{ bottom: size * 0.03 }}>
        <div className="font-mono font-semibold tracking-tight tabular-nums" style={{ fontSize: size * 0.085, lineHeight: 1 }}>
          {shown.toFixed(2)}
        </div>
        <div className="eyebrow-readout mt-2 text-[12px]">
          {label}
          {caption ? ` · ${caption}` : ''}
        </div>
      </div>
    </div>
  );
}
