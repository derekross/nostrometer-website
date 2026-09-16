import { cn } from '@/lib/utils';

/** A ruler of hairline ticks, used as the divider between sections. */
export function TickRuler({ className }: { className?: string }) {
  return <div role="separator" aria-orientation="horizontal" className={cn('tick-ruler w-full', className)} />;
}
