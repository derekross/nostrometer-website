import { cn } from '@/lib/utils';

interface GaugeProps {
  /** 0..1, where the tier thresholds sit at 0.25, 0.5 and 0.75. */
  value: number;
  label: string;
  sub?: string;
  size?: number;
  className?: string;
}

const START = 135;
const SWEEP = 270;

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

const BANDS: { from: number; to: number; token: string }[] = [
  { from: 0, to: 0.25, token: 'var(--gauge-1)' },
  { from: 0.25, to: 0.5, token: 'var(--gauge-2)' },
  { from: 0.5, to: 0.75, token: 'var(--gauge-3)' },
  { from: 0.75, to: 1, token: 'var(--gauge-4)' },
];

const RIM_LABELS: { at: number; letter: string }[] = [
  { at: 0.125, letter: 'B' },
  { at: 0.375, letter: 'S' },
  { at: 0.625, letter: 'I' },
  { at: 0.875, letter: 'F' },
];

/**
 * A 270° dial. Bands are four lightness steps of the brand violet from Borked
 * to Flawless; the needle and pivot draw in the foreground ink.
 */
export function Gauge({ value, label, sub, size = 320, className }: GaugeProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const sw = size * 0.075;
  const v = Math.min(1, Math.max(0, value));
  const [nx, ny] = polar(cx, cy, r - sw * 1.1, START + SWEEP * v);

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }} role="img" aria-label={`${label}. ${sub ?? ''}`.trim()}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
        {BANDS.map((b) => (
          <path key={b.token} d={arc(cx, cy, r, b.from, b.to)} fill="none" style={{ stroke: b.token }} strokeWidth={sw} />
        ))}
        {Array.from({ length: 11 }, (_, i) => {
          const major = i % 5 === 0;
          const a = START + (SWEEP / 10) * i;
          const [x0, y0] = polar(cx, cy, r - sw * 0.9, a);
          const [x1, y1] = polar(cx, cy, r - sw * (major ? 1.5 : 1.2), a);
          return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} className="stroke-foreground" strokeWidth={major ? 2 : 1.2} strokeLinecap="round" />;
        })}
        {RIM_LABELS.map((l) => {
          const [x, y] = polar(cx, cy, r + sw * 1.15, START + SWEEP * l.at);
          return (
            <text key={l.letter} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground font-mono font-semibold" fontSize={size * 0.04}>
              {l.letter}
            </text>
          );
        })}
        <line x1={cx} y1={cy} x2={nx} y2={ny} className="stroke-foreground" strokeWidth={size * 0.014} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={size * 0.022} className="fill-foreground" />
      </svg>
      <div className="absolute inset-x-0 text-center" style={{ bottom: size * 0.04 }}>
        <div className="font-mono font-semibold tracking-tight" style={{ fontSize: size * 0.075, lineHeight: 1.1 }}>
          {label}
        </div>
        {sub && <div className="eyebrow mt-1.5 text-xs">{sub}</div>}
      </div>
    </div>
  );
}
