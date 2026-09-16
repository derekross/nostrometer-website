# Plan: `nostrometer-website` — public site for nostrometer.com

> **Status (2026-09-15):** sections 1–7 and 9.1–9.5 done; the site builds, prerenders and
> passes `npm run test`. Changes from the original plan, all at Derek's request or found in
> verification:
> - No borkstr.com references anywhere in copy (the `borkstr` NIP-32 label namespace string
>   stays in `appReviews.ts` because published rating events carry it and the parser requires it).
> - No "Vibed with MKStack" footer credit; the About "Source" box lists the two repos with no
>   language/licence/template notes.
> - **Ratings snapshot** (`public/data/ratings.json`, from the tooling's `ratings.jsonl`) is
>   merged with the live relay read (`src/lib/reviews.ts`, `src/hooks/useReviews.ts`; newest
>   revision per rater+app+NIP wins) so the matrix never shows fewer ratings than the last
>   crawl. `NostrProvider` `eoseTimeout` raised 200 → 5000 ms: the template default stopped
>   collecting 200 ms after the *first* relay's EOSE, so the fastest relay decided the result set.
> - `tools/seo/plugin.ts#prerenderIndexFix`: the prerender plugin's re-emit of `/` as
>   `index.html` is dropped on Vite 8; the fix writes the captured home HTML after `closeBundle`.
> - Vite `assetsInlineLimit: 0`: small font subsets were inlined as `data:` URIs, which the CSP
>   `font-src 'self'` blocks.
> - Constants shared between components live in `src/lib/{nav,tiers,nips,updates}.ts`
>   (react-refresh lint rule).
> - **Direction A implemented (2026-09-15):** violet-ramp `Gauge` in the home hero reading the
>   mean of all rated cells; coverage row on both matrices; results page with segmented sort,
>   compact 30-column table and a click-to-open column detail panel; app report rebuilt as a
>   score card (readouts, 30-chip strip, collapsible per-NIP rows with filter, sticky rail).
>   Design canvas: https://claude.ai/artifact/GMLszeSAPVpaTN7H64uNPw
> - Remaining (manual, section 8): create GitHub repo `derekross/nostrometer-website` with
>   Derek's go-ahead, add the `PROD_*` secrets, then DNS + `setup-site.sh` + certbot on nostr01
>   via the `deploy-nostr01` skill; post-deploy checks in 9.6.

## Context

Nostrometer is Derek Ross's Nostr interoperability measurement program: every app discovered
(kind 31990 NIP-89 listings), ranked by real usage (NIP-45 distinct-author MAU), rated NIP-by-NIP
with open kind 31986 events (Flawless 1.0 · Incomplete 0.6 · Isolated 0.3 · Borked 0.1; median
wins; overall = median of per-NIP medians). Ratings are published on nostrhub.io; the tooling repo
is `~/Projects/nostrometer` (Python, private GitHub `derekross/nostrometer`, going public soon).
Seven wave-1 apps have desk reviews; three have published reports.

nostrometer.com needs a public, mission-focused site: what the project is, why interoperability
matters, how the meter works, the live results, how developers participate, and updates.
**Never mention grants or funding.** Built from the mkstack template, deployed to the nostr01 VPS.

Decisions already made by Derek: live matrix from relays; pages = Home, Methodology, Results
(+ per-app), For developers, Updates, About; hosting nostr01; **a new visual identity** (not
derekross.me's dark glass, not soapbox.pub's azure editorial); Updates = Derek's kind 30023
articles tagged `#nostrometer`, rendered on-site.

Derek's pubkey (hex): `3f770d65d3a764a9c5cb503ae123e62ec7598ad035d836e2a810f3877a745b24`.

## 1. Bootstrap

0. **First action after approval:** copy this plan file verbatim to
   `~/Projects/nostrometer-website/PLAN.md` (create the directory if the template copy hasn't
   happened yet) and commit it with the initial commit, so the plan lives in the repo, not only in
   `~/.claude/plans/`. Keep it updated as sections are completed (check them off).
1. `cp -r ~/Projects/mkstack ~/Projects/nostrometer-website`, drop `node_modules`, `dist`,
   `.git`, `opencode.json`; `git init -b main`. Keep `AGENTS.md`, `.agents/skills`,
   `eslint-rules`, `.mcp.json`. Read `AGENTS.md` first; its rules apply (never `any`, `useNostr`
   from `@nostrify/react`, author-filter addressable queries, no `dangerouslySetInnerHTML`, keep
   the CSP, run `npm run test` before finishing, commit when done).
2. `package.json`: name `nostrometer-website`, version `0.1.0`, license MIT. Scripts: keep
   `dev/build/test`; add `"build:prerender": "PRERENDER=1 npm run build"` and
   `"sync-data": "bash scripts/sync-data.sh"`. Deps: `react-markdown`,
   `@fontsource-variable/archivo`, `@fontsource-variable/public-sans`,
   `@fontsource-variable/jetbrains-mono`. Dev: `@prerenderer/rollup-plugin`,
   `@prerenderer/renderer-puppeteer`, `puppeteer`.
3. `index.html`: keep the template CSP verbatim (`img-src https:` and `connect-src wss:` already
   cover pictures and relays; fonts are self-hosted). Add `<title>Nostrometer: Nostr
   interoperability, measured</title>`, `meta description` = tagline, `og:type/title/
   description/image/url`, `twitter:card summary_large_image`, `theme-color`, favicon and
   apple-touch links. Lint requires description, viewport, the OG tags, and a manifest link.
4. `public/manifest.webmanifest` (shape from `~/Projects/derekross.me/public/manifest.webmanifest`),
   `public/favicon.svg` (gauge mark, below), `public/apple-touch-icon.png`, `public/og.png`
   1200×630 (generate once), `public/robots.txt` with `Sitemap: https://nostrometer.com/sitemap.xml`.
   Keep `_redirects`. Remove every `// FIXME` (lint fails on them).
5. `src/lib/appRelays.ts`: `relay.ditto.pub`, `relay.dreamith.to`, `nos.lol`, `nostr.mom`, all
   read+write. Remove primal. `App.tsx` stays as shipped (theme default light).
6. Footer credit "Vibed with MKStack" → https://soapbox.pub/mkstack (template rule).

## 2. Visual identity (new)

**Concept:** an instrument, not a brand. Paper-white / graphite panels, ink hairlines, tick
marks, tabular numerals, one flat accent. No gradients, blur, glass, or hero illustrations.

**Tokens** (`src/index.css`, replace the `:root` / `.dark` blocks; HSL triplets):

| token | light | dark |
|---|---|---|
| --background | 40 20% 98% | 240 8% 7% |
| --foreground | 240 10% 10% | 40 12% 92% |
| --card, --popover | 0 0% 100% | 240 7% 10% |
| --primary ("meter violet") | 262 60% 45% | 262 85% 76% |
| --primary-foreground | 0 0% 100% | 262 60% 12% |
| --secondary, --muted | 40 14% 93% | 240 6% 15% |
| --muted-foreground | 240 6% 38% | 240 5% 68% |
| --accent / --accent-foreground | 262 60% 95% / 262 60% 30% | 262 40% 18% / 262 85% 82% |
| --destructive | 0 72% 44% | 0 85% 70% |
| --border, --input | 40 10% 84% | 240 6% 20% |
| --ring | = primary | = primary |
| --radius | 0.375rem | 0.375rem |

Tier tokens (hues from NostrHub, lightness retuned for AA on both themes):
`--tier-flawless 142 72% 29% / 142 65% 58%` · `--tier-incomplete 41 96% 31% / 48 96% 56%` ·
`--tier-isolated 25 95% 36% / 25 95% 62%` · `--tier-borked 0 72% 44% / 0 85% 70%`. Chip fill =
ink at 14% via `color-mix(in oklab, …)`, border = ink at 40%, letter = ink; chips always carry
the letter, never color alone. Violet is used only for links, primary buttons, the needle, and one
underlined phrase per headline.

**Type:** display Archivo Variable (700, `font-stretch:110%`, tracking -0.02em), body Public Sans
Variable (400/600), mono JetBrains Mono Variable for NIP ids, kinds, scores, MAU, eyebrows.
Scale: h1 56/64 (40/48 mobile), h2 40/48, h3 28/36, body 18/28, chip 14/20 mono 600, stat
numeral 48/56 mono tnum. Eyebrows: mono 14 uppercase tracking 0.12em muted.

**Logo / favicon:** pure SVG `MeterMark` (`viewBox 0 0 32 32`): 270° arc stroke width 3 in
`currentColor` with round caps and a gap at the bottom, five tick marks, one violet needle from
centre to the 75% position, 2.5px centre dot. Wordmark "Nostrometer" in Archivo 700. Also a CSS
"tick ruler" divider (`repeating-linear-gradient` 1px ticks every 8px, taller every 40px) used
between sections. `favicon.svg` flips arc color under `prefers-color-scheme: dark`.

**Layout:** sticky 64px header (`bg-background border-b`, no blur): mark + wordmark · Results ·
Methodology · For developers · Updates · About · GitHub icon · theme toggle (copy from the
`theming` skill); `Sheet` on mobile. Sections `py-16 md:py-24`, prose `max-w-[65ch]`, data
`max-w-6xl`. Cards `bg-card border rounded-md p-6`, no shadow. Stat tiles: eyebrow, 48px mono
numeral, muted "as of {date} UTC". Footer: wordmark + one-liner · page links · "Open source ·
Read-only crawls · Signature-verified" with GitHub/Nostr links · bottom row: MKStack credit, repo,
raw data links.

## 3. Files

```
scripts/sync-data.sh                 # python3 stdlib join of ../nostrometer/data → public/data
public/data/metrics.json             # { relay, since, until, crawled_at, byAddress: {addr: {id,name,mau|null}} }
public/data/claimed.json             # { generated_at, byAddress: {addr: {repo, nips: [...]}} }
tools/seo/plugin.ts, tools/seo/fetch.ts   # ported from ~/Projects/derekross.me (sitemap + build-time route discovery)
src/lib/appReviews.ts                # VERBATIM from ~/Projects/nostrhub/src/lib/appReviews.ts
src/lib/apps.ts                      # VERBATIM from ~/Projects/nostrhub/src/lib/apps.ts
src/lib/matrix.ts                    # pure buildMatrix(); mirrors ~/Projects/nostrometer/scripts/gen_matrix.py semantics
src/lib/staticData.ts                # types + fetch('/data/metrics.json' | '/data/claimed.json')
src/lib/sanitizeUrl.ts               # from .agents/skills/nostr-security
src/lib/site.ts                      # SITE_URL, DEREK_PUBKEY_HEX, UPDATES_TAG='nostrometer', NOSTRHUB_URL, REPO_URL
src/lib/seo.ts                       # absoluteUrl, canonicalPath (from derekross.me)
src/hooks/useAllAppReviews.ts        # nostrhub's useAllAppReviews + useAppReviews(address)
src/hooks/useRatedApps.ts            # 31990 listings for rated addresses, one author-filtered query per pubkey
src/hooks/useStaticData.ts           # useMetrics / useClaimed, staleTime Infinity, retry 1
src/hooks/useMatrix.ts               # joins reviews × listings × static data via buildMatrix
src/hooks/useUpdates.ts              # 30023 authors:[DEREK] '#t':['nostrometer'] limit 50; useUpdate(naddr)
src/components/{Layout,Navigation,Footer,CanonicalLink,MarkdownContent,MeterMark,TickRuler,ThemeToggle}.tsx
src/components/matrix/{MatrixTable,TierCell,TierBadge,NipHeader,MatrixLegend}.tsx
src/components/app/{AppHeader,NipRatingList,RaterRow}.tsx
src/components/sections/{Hero,StatTiles,Mission,HowItWorks,TierScale,MatrixPreview,LatestUpdates}.tsx
src/pages/{Index,MethodologyPage,ResultsPage,AppPage,DevelopersPage,UpdatesPage,UpdatePage,AboutPage,NotFound,NIP19Page}.tsx
.github/workflows/deploy.yml
```

## 4. Routes (`src/AppRouter.tsx`, lazy except Index, all above `*`)

`/`, `/methodology`, `/results`, `/app/:naddr`, `/developers`, `/updates`, `/updates/:naddr`,
`/about`, existing `/:nip19`, `*`. `NIP19Page`: naddr of kind 31990 → `<Navigate to="/app/…">`;
kind 30023 by Derek → `/updates/…`; npub → njump link; else NotFound. No `LoginArea` anywhere:
the site is read-only, rating happens on nostrhub.io.

## 5. Data model

**Static export** (`scripts/sync-data.sh`, inline python3 over
`../nostrometer/data/{registry.jsonl,metrics.json,claimed.jsonl}`): key everything by
`31990:<pubkey>:<d>` (the only key ratings carry) using registry `address` **and**
`duplicate_addresses`; skip rows with `address: null` or `spam_like`. Commit outputs; re-run after
each `make metrics claims` in nostrometer. `/data/*.json` is cached 1 day by the server.

**Hooks.** `useAllAppReviews`: `{kinds:[31986], '#l':['nip-compatibility'], limit:1000}`, 10 s
timeout, dedupe latest per `pubkey:d` (nostrhub's code). `useRatedApps(reviews)`: distinct
addresses grouped by pubkey → one `{kinds:[31990], authors:[pk], '#d':[…]}` query per pubkey →
`dedupeAppEvents`; rated apps show even with thin listing metadata. `useMatrix` combines the three.

**`src/lib/matrix.ts`** (unit-tested):
```ts
interface MatrixCell { tier: CompatTier; rating: number; raters: number; selfOnly: boolean }
interface MatrixRow  { address; app: AppInfo|null; name; overall: TierAggregate|null;
                       cells: Map<nip, MatrixCell>; mau: number|null; claimed: Set<nip> }
buildMatrix(reviews, apps, metrics, claimed): MatrixRow[]
```
Per NIP `median` → `ratingToTier`; `selfOnly` = every rater pubkey equals the address pubkey;
`overall` via `aggregateReviews`. Rows = addresses with ≥1 review, sorted `(-(mau ?? 0), name)`.
Columns = `TRACKED_NIPS` (30); untracked NIP ids listed only on the app page. MAU `null` → `?`,
never 0.

**Results page.** Legend (F, I, S, B, `*` self-rated, hatched `c` claimed, dot = unknown) always
visible; controls: search, "hide apps with no data" switch, NIP selector. `MatrixTable`: shadcn
`Table` in `overflow-x-auto`, sticky header and first column, row hover; `TierCell` 32×24 chip with
letter, superscript rater count, `*` + dashed border when self-only, tooltip "Incomplete · 2 raters
· self-rated"; `NipHeader` mono id with tooltip name/description; provenance line from
`metrics.json` header. Row click → `/app/:naddr`. Loading: skeleton grid; relay failure after
timeout: `border-dashed` error card with Retry (`refetch`) and links to nostrhub/GitHub; empty set:
empty-state card. Static MAU still renders if relays are down; missing `/data/*.json` still
renders cells with MAU `?`.

**`/app/:naddr`.** Decode; require kind 31990; nostrhub's author-scoped `useApp` + `useAppReviews`
+ static lookups. `AppHeader` (picture via `sanitizeUrl`, `referrerPolicy="no-referrer"`,
`loading="lazy"`, initials fallback; name, about, website, platforms, listing publisher via
`useAuthor`, MAU), overall tier, `NipRatingList` (card per NIP: aggregate tier, then `RaterRow`
per review with avatar/name via `useAuthor`, tier badge, "Self-rated" badge when `pubkey ===
app.pubkey`, comment as plain text, date), claimed-vs-rated NIPs, buttons "Rate on nostrhub.io"
(verify the nostrhub app route path before hardcoding) and "View listing". If rater counts grow,
batch kind-0 lookups in one `authors:[…]` query.

**Updates.** `useUpdates` as above, dedupe by `d`, sort by `published_at`; `/updates/:naddr`
re-checks `pubkey === DEREK_PUBKEY_HEX` after decode. `MarkdownContent` ported from derekross.me
(react-markdown; links `rel="noopener noreferrer"`; image `src` through `sanitizeUrl`; no
`NostrMention` dependency).

## 6. Page copy (anchor lines; tone: plain, confident, short declaratives, one highlighted phrase)

- **Home** h1 "Every Nostr app, **measured** against the spec." Lede = the README tagline. Bullets:
  Discovered (31990 crawled, signature-verified) · Ranked (distinct monthly authors, not
  downloads) · Rated (one chip per NIP, community median) · Open (31986 events anyone can publish;
  tooling on GitHub). CTAs: See the results / How we rate. Then stat tiles (apps discovered,
  community ratings, NIPs tracked), a top-10 matrix preview, three mission cards (fewer one-client
  surprises for users · a concrete fix list for developers · gentle pressure toward interoperability).
- **Methodology** h1 "How the meter works." Lede "Three read-only crawls, one rating rule, and a
  median. Nothing here needs trust in us." Sections: Discovery (developer's own key wins over
  same-named listings) · Usage (NIP-45 COUNT distinct authors on `#client`; failed = `?`) ·
  Rating rule (quote README "How to rate" verbatim) · Tiers and trust (values, median, self-ratings
  marked, rater counts, current NIP text always checked).
- **Results** h1 "The scoreboard." Lede "Apps by real usage, NIPs across the top, one chip per
  cell." + generated date and counts; raw data links.
- **For developers** h1 "Your fix list, sorted by impact." Publish a kind 31990 listing (what it
  needs: `d`, name/picture/about/website, `k`, platform tags, `i` NIP refs; nostrhub.io/apps wizard
  or the `nak event --sec <nsec|ncryptsec|bunker://> < listing.json <relays>` one-liner) · tag
  events with `#client` so usage counts you · publish your own 31986 ratings (shown, marked
  self-rated until confirmed) · disagree with a cell? publish a rating, the median moves · request a
  review (GitHub issue, Derek's npub).
- **Updates** h1 "What changed." Lede "Crawl dates, new apps, rule changes, and NIP revisions
  that shifted a score." Kind 30023 feed; mention how to follow on Nostr.
- **About** h1 "A meter, not a leaderboard." Built and maintained by Derek Ross; read-only,
  signature-verified crawls; open source; data shared 1:1 with nostrhub.io/apps;
  the name = an instrument that measures, it reports, it does not decide. Contact: npub + GitHub.

## 7. SEO / prerender

Port `vite.config.ts` and `tools/seo/plugin.ts` from `~/Projects/derekross.me` (swap
`@vitejs/plugin-react-swc` → `@vitejs/plugin-react`). At `PRERENDER=1`, `tools/seo/fetch.ts` uses
nostr-tools `SimplePool` over the four relays to discover `/app/<naddr>` (from 31986 addresses)
and `/updates/<naddr>` routes; sitemap for static + dynamic routes; `renderAfterTime: 4000`;
fall back to static routes on fetch failure, never fail the build. Every page: `useSeoMeta` +
`CanonicalLink`.

## 8. Deploy (`.github/workflows/deploy.yml`)

Copy `~/Projects/plektos/.github/workflows/deploy.yml`: push to `main` + `workflow_dispatch`,
`concurrency: deploy`, node 22, `npm ci`, `npm run build:prerender`,
`burnett01/rsync-deployments@v9` with `switches: -rlt --omit-dir-times --delete
--exclude='.well-known/'`, `path: dist/`, secrets `PROD_HOST PROD_USER PROD_SSH_KEY PROD_PATH
PROD_PORT` (port 1022). DNS A record, `setup-site.sh`, certbot are a separate manual step via the
`deploy-nostr01` skill (not part of this plan's code). Create the GitHub repo
`derekross/nostrometer-website` via `gh` only with Derek's go-ahead.

## 9. Verification

1. `npm run sync-data` then `npm run test` (tsc, eslint incl. HTML/manifest rules, vitest, build;
   confirm `dist/404.html`). `src/lib/matrix.test.ts`: median tie, `selfOnly`, null-MAU sort,
   duplicate-address join.
2. `npm run dev`: skeleton grid while loading; rows sorted by MAU; `*` on Amethyst's self-rated
   cells; tooltips; row → app page; `/npub…` and `/naddr…` redirects; Updates lists only
   `#nostrometer` articles; a 30023 naddr by another author → 404.
3. Relay outage: point `appRelays.ts` at a dead host → error card with Retry after the timeout;
   static MAU still shows. Restore relays.
4. `npm run build:prerender`: `dist/results/index.html` contains app names; `sitemap.xml` lists
   `/app/*`. Check light and dark with the toggle at 360px width.
5. Accessibility pass on tier chips (letter + color, 4.5:1) and keyboard nav in the table.
6. Post-deploy (later): `curl -I` on `/assets/*` (immutable), `/data/metrics.json` (1 day), `/`
   (no-store); deep link `/app/<naddr>` returns 200.

## 10. Risks and guardrails

- Relay flakiness: NPool merges after EOSE timeout; a dead set → explicit error state;
  prerendered HTML keeps SEO. `retry: 1`.
- Untrusted picture URLs: `sanitizeUrl` https-only, no-referrer, lazy, initials fallback. Tier
  colors stay inline styles (nostrhub's "untrusted data never reaches CSS" rule).
- `limit: 1000` on reviews is fine at 122; page by `since` when it nears the cap.
- Prerender in CI needs relay access from GitHub runners; best-effort.
- Never: grants/funding mentions, `LoginArea`, `dangerouslySetInnerHTML`, CSP relaxation, `any`.
