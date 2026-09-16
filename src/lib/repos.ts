import type { AppRepoRef } from '@/lib/apps';
import { sanitizeUrl } from '@/lib/sanitizeUrl';

/** NIP-34 repository announcement kind. */
export const GIT_REPO_KIND = 30617;

export type RepoLabel =
  | { kind: 'nostr'; ref: AppRepoRef }
  | { kind: 'web'; url: string; host: string }
  | { kind: 'none' };

/**
 * What to show as an app's repository: its NIP-34 announcement when the
 * listing references one, else the repo URL the source research used, else
 * nothing. The web URL is untrusted and must be https.
 */
export function repoLabel(refs: AppRepoRef[], webUrl: string | null): RepoLabel {
  if (refs.length > 0) return { kind: 'nostr', ref: refs[0] };
  const url = sanitizeUrl(webUrl);
  if (url) {
    try {
      return { kind: 'web', url, host: new URL(url).hostname.replace(/^www\./, '') };
    } catch {
      /* unreachable after sanitizeUrl */
    }
  }
  return { kind: 'none' };
}
