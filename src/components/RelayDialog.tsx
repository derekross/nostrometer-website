import { useState } from 'react';
import { Plus, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAppContext } from '@/hooks/useAppContext';
import { useRelayProbe } from '@/hooks/useRelayProbe';
import { defaultRelays, normalizeRelayUrl, relayHost, sameRelay, suggestedRelays } from '@/lib/relays';
import { cn } from '@/lib/utils';

interface RelayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Relay = { url: string; read: boolean; write: boolean };

/** What one relay answered with: a rating count and a round trip, or nothing. */
function Reading({ status, count, ms }: { status: 'reading' | 'ok' | 'error'; count?: number; ms?: number }) {
  if (status === 'reading') {
    return <span className="font-mono text-xs text-muted-foreground tabular-nums">reading…</span>;
  }
  if (status === 'error' || count === undefined) {
    return <span className="font-mono text-xs text-destructive tabular-nums">no answer</span>;
  }
  return (
    <span className="font-mono text-xs tabular-nums">
      <span className={count > 0 ? 'text-primary' : 'text-muted-foreground'}>{count}</span>
      <span className="text-muted-foreground"> · {(ms ?? 0) / 1000 < 10 ? `${((ms ?? 0) / 1000).toFixed(1)}s` : '10s+'}</span>
    </span>
  );
}

export function RelayDialog({ open, onOpenChange }: RelayDialogProps) {
  const { config, updateConfig } = useAppContext();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const relays = config.relayMetadata.relays;
  const enabledCount = relays.filter((r) => r.read).length;
  const probes = useRelayProbe(
    relays.map((r) => r.url),
    open,
  );
  const suggestions = suggestedRelays(relays);

  /**
   * One update per action: `updateConfig` resolves its updater against the
   * render-scoped config, so two calls in the same tick would lose the first.
   * The timestamp keeps a later NIP-65 sync from silently replacing a choice
   * made here.
   */
  const save = (next: Relay[]) => {
    updateConfig((current) => ({
      ...current,
      relayMetadata: { relays: next, updatedAt: Math.floor(Date.now() / 1000) },
    }));
  };

  const toggle = (url: string, read: boolean) => {
    save(relays.map((r) => (sameRelay(r.url, url) ? { ...r, read, write: read } : r)));
  };

  const remove = (url: string) => {
    save(relays.filter((r) => !sameRelay(r.url, url)));
  };

  const add = (value: string) => {
    const url = normalizeRelayUrl(value);
    if (!url) {
      setError('Relay URLs must start with wss://');
      return;
    }
    if (relays.some((r) => sameRelay(r.url, url))) {
      setError('That relay is already in the list.');
      return;
    }
    save([...relays, { url, read: true, write: true }]);
    setDraft('');
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <DialogHeader className="border-b px-4 py-5 sm:px-6">
          <DialogTitle className="eyebrow-readout text-[13px]">Reading from</DialogTitle>
          <DialogDescription className="text-base">
            Ratings, listings and updates are read from these relays. The reading beside each one is how many
            ratings it answered with just now.
          </DialogDescription>
        </DialogHeader>

        <ul className="divide-y border-b">
          {relays.map((relay) => {
            const probe = probes.get(relay.url);
            const lastEnabled = relay.read && enabledCount === 1;
            return (
              <li key={relay.url} className="flex items-center gap-3 px-4 py-3 sm:px-6">
                <Switch
                  checked={relay.read}
                  disabled={lastEnabled}
                  onCheckedChange={(checked) => toggle(relay.url, checked)}
                  aria-label={`Read from ${relayHost(relay.url)}`}
                />
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between sm:gap-3">
                  <span className={cn('block truncate font-mono text-sm', !relay.read && 'text-muted-foreground line-through')}>
                    {relayHost(relay.url)}
                  </span>
                  <span className="mt-0.5 block sm:mt-0 sm:shrink-0">
                    <Reading status={probe?.status ?? 'reading'} count={probe?.reading?.count} ms={probe?.reading?.ms} />
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={relays.length <= 1}
                  onClick={() => remove(relay.url)}
                  aria-label={`Remove ${relayHost(relay.url)}`}
                >
                  <X className="size-4" />
                </Button>
              </li>
            );
          })}
        </ul>

        <div className="space-y-4 border-b px-4 py-5 sm:px-6">
          <div>
            <Label htmlFor="relay-add" className="eyebrow mb-2 block text-[11px]">
              Add a relay
            </Label>
            <div className="flex gap-2">
              <Input
                id="relay-add"
                value={draft}
                placeholder="wss://relay.example.com"
                spellCheck={false}
                autoComplete="off"
                onChange={(e) => {
                  setDraft(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    add(draft);
                  }
                }}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'relay-add-error' : undefined}
                className="h-10 font-mono text-sm"
              />
              <Button className="h-10" onClick={() => add(draft)} disabled={!draft.trim()}>
                Add
              </Button>
            </div>
            {error && (
              <p id="relay-add-error" className="mt-2 text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          {suggestions.length > 0 && (
            <div>
              <p className="eyebrow mb-2 text-[11px]">Suggested</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <Button key={s.url} variant="outline" size="sm" className="font-mono" onClick={() => add(s.url)}>
                    <Plus className="size-3.5" /> {s.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 border-b px-4 py-5 sm:px-6">
          <Switch
            id="live-only"
            checked={config.liveOnly}
            onCheckedChange={(checked) => updateConfig((current) => ({ ...current, liveOnly: checked }))}
          />
          <div className="min-w-0">
            <Label htmlFor="live-only" className="text-base">
              Live only
            </Label>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              Ratings normally include the last crawl, so the matrix never shows fewer than were found then. Turn
              this on to see only what the relays above answered with.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:justify-between">
          <Button variant="ghost" onClick={() => save(defaultRelays())}>
            <RotateCcw className="size-4" /> Reset to defaults
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
